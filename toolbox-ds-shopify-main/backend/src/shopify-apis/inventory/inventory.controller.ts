import {
  Controller, Get, Param, Post, Put, Patch, Delete, Body, BadRequestException,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { ShopifyService } from '../../common/environment/shopify.service';
import { Inventory, InventoryPostInput } from './inventory.model';

type ActiveLocation = { id: string; name: string };

class InventoryDataAccess {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly config: ConfigService,
  ) {}

  private getGraphql() {
    const shopify = this.shopifyService.getClient();
    const shop = this.config.get<string>('SHOPIFY_HOST')!;
    const accessToken = this.config.get<string>('API_Access_Token_Key')!;
    const session = shopify.session.customAppSession(shop);
    session.accessToken = accessToken;
    return new shopify.clients.Graphql({ session });
  }

  private async getActiveLocations(): Promise<ActiveLocation[]> {
    const client = this.getGraphql();
    const query = `
      query ActiveLocations($first:Int!,$after:String){
        locations(first:$first, after:$after){
          pageInfo{ hasNextPage endCursor }
          nodes{ id name isActive }
        }
      }`;
    const out: ActiveLocation[] = [];
    let after: string | null = null;
    let hasNext = true;

    while (hasNext) {
      const resp: any = await client.query({ data: { query, variables: { first: 250, after } } });
      const nodes: any[] = resp?.body?.data?.locations?.nodes ?? [];
      nodes.forEach(n => { if (n?.isActive) out.push({ id: n.id, name: n.name }); });
      hasNext = !!resp?.body?.data?.locations?.pageInfo?.hasNextPage;
      after = resp?.body?.data?.locations?.pageInfo?.endCursor ?? null;
    }
    return out;
  }

  private async getLocationIdByName(name: string) {
    const active = await this.getActiveLocations();
    const found = active.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (!found) throw new BadRequestException(`Active location "${name}" not found`);
    return found.id;
  }

  private async getInventoryItemIdBySku(sku: string) {
    const client = this.getGraphql();
    const q = `
      query ItemBySku($first:Int!, $query:String!){
        inventoryItems(first:$first, query:$query){
          nodes{ id sku }
        }
      }`;
    const resp: any = await client.query({ data: { query: q, variables: { first: 10, query: `sku:${sku}` } } });
    const nodes: any[] = resp?.body?.data?.inventoryItems?.nodes ?? [];
    const exact = nodes.find(n => n?.sku === sku);
    if (!exact) throw new BadRequestException(`SKU "${sku}" not found`);
    return exact.id;
  }

  private async getInventoryLevelId(inventoryItemId: string, locationId: string): Promise<string | null> {
    const client = this.getGraphql();
    const q = `
      query Levels($id: ID!, $first: Int!, $after: String) {
        location(id: $id) {
          inventoryLevels(first: $first, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              item { id }
            }
          }
        }
      }`;
    let after: string | null = null;
    let hasNext = true;
    while (hasNext) {
      const resp: any = await client.query({ data: { query: q, variables: { id: locationId, first: 250, after } } });
      const body = resp?.body ?? {};
      const nodes: any[] = body?.data?.location?.inventoryLevels?.nodes ?? [];
      const found = nodes.find(n => n?.item?.id === inventoryItemId);
      if (found?.id) return found.id;
      hasNext = !!body?.data?.location?.inventoryLevels?.pageInfo?.hasNextPage;
      after = body?.data?.location?.inventoryLevels?.pageInfo?.endCursor ?? null;
    }
    return null;
  }

  private async getInventoryForLocation(loc: ActiveLocation): Promise<Inventory[]> {
    const client = this.getGraphql();
    const query = `
      query Levels($id: ID!, $first: Int!, $after: String) {
        location(id: $id) {
          id
          name
          inventoryLevels(first: $first, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              item { id sku }          # inventoryItemId
              location { id name }     # locationId (same as $id)
              quantities(names: ["available"]) { name quantity }
            }
          }
        }
      }
    `;

    const rows: Inventory[] = [];
    let after: string | null = null;
    let hasNext = true;

    while (hasNext) {
      const resp: any = await client.query({
        data: { query, variables: { id: loc.id, first: 250, after } },
      });
      const body = resp?.body ?? {};
      const nodes: any[] = body?.data?.location?.inventoryLevels?.nodes ?? [];

      for (const node of nodes) {
        const sku: string | null = node?.item?.sku ?? null;
        if (!sku) continue;
        const availableEntry = (node?.quantities ?? []).find((q: any) => q?.name === 'available');
        const qty = (availableEntry?.quantity ?? 0) as number;

        rows.push({
          sku,
          locationName: node?.location?.name ?? loc.name,
          locationId: node?.location?.id ?? loc.id,
          inventoryItemId: node?.item?.id ?? '',
          quantity: qty,
        });
      }

      hasNext = !!body?.data?.location?.inventoryLevels?.pageInfo?.hasNextPage;
      after = body?.data?.location?.inventoryLevels?.pageInfo?.endCursor ?? null;
    }
    return rows;
  }

  async fetchAll(): Promise<Inventory[]> {
    const active = await this.getActiveLocations();
    const all: Inventory[] = [];
    for (const loc of active) {
      const rows = await this.getInventoryForLocation(loc);
      all.push(...rows);
    }
    return all;
  }

  async fetchBySku(sku: string): Promise<Inventory[]> {
    const all = await this.fetchAll();
    return all.filter(r => r.sku === sku);
  }

  async activate(input: InventoryPostInput): Promise<Inventory> {
    const client = this.getGraphql();
    const locationId = input.locationId ?? await this.getLocationIdByName(input.locationName!);
    const inventoryItemId = await this.getInventoryItemIdBySku(input.sku);

    const mutation = `
      mutation ActivateInventory($inventoryItemId: ID!, $locationId: ID!, $available: Int) {
        inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId, available: $available) {
          inventoryLevel {
            id
            item { id }
            location { id }
            quantities(names:["available"]) { name quantity }
          }
          userErrors { field message }
        }
      }`;

    const resp: any = await client.query({
      data: {
        query: mutation,
        variables: {
          inventoryItemId,
          locationId,
          available: typeof input.quantity === 'number' ? input.quantity : null,
        },
      },
    });
    const err = resp?.body?.data?.inventoryActivate?.userErrors?.[0];
    if (err) throw new BadRequestException(err.message);

    const level = resp?.body?.data?.inventoryActivate?.inventoryLevel;
    const qty = level?.quantities?.[0]?.quantity ?? 0;

    return {
      sku: input.sku,
      locationName: input.locationName ?? '',
      locationId,
      inventoryItemId,
      quantity: qty,
    };
  }

  async setAvailableQuantity(input: InventoryPostInput): Promise<Inventory> {
    const client = this.getGraphql();
    const locationId = input.locationId ?? await this.getLocationIdByName(input.locationName!);
    const inventoryItemId = await this.getInventoryItemIdBySku(input.sku);

    const mutation = `
      mutation SetQty($input: InventorySetQuantitiesInput!) {
        inventorySetQuantities(input: $input) {
          inventoryAdjustmentGroup { changes { name delta quantityAfterChange } }
          userErrors { field message code }
        }
      }`;

    const ignoreCompare =
      input.compareQuantity == null ? true : (input.ignoreCompareQuantity ?? false);

    const variables = {
      input: {
        name: "available",
        reason: input.reason ?? "other",
        referenceDocumentUri: input.referenceDocumentUri,
        ignoreCompareQuantity: ignoreCompare,
        quantities: [{
          inventoryItemId,
          locationId,
          quantity: input.quantity,
          ...(input.compareQuantity != null ? { compareQuantity: input.compareQuantity } : {})
        }]
      }
    };

    const resp: any = await client.query({ data: { query: mutation, variables } });
    const err = resp?.body?.data?.inventorySetQuantities?.userErrors?.[0];
    if (err) throw new BadRequestException(`${err.code ?? 'ERROR'}: ${err.message}`);

    const qAfter =
      resp?.body?.data?.inventorySetQuantities?.inventoryAdjustmentGroup?.changes?.[0]?.quantityAfterChange
      ?? input.quantity;

    return { sku: input.sku, locationName: input.locationName ?? '', locationId, inventoryItemId, quantity: qAfter };
  }

  async adjustAvailableQuantity(input: InventoryPostInput): Promise<Inventory> {
    const client = this.getGraphql();
    const locationId = input.locationId ?? await this.getLocationIdByName(input.locationName!);
    const inventoryItemId = await this.getInventoryItemIdBySku(input.sku);

    const mutation = `
      mutation AdjustQty($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
          inventoryAdjustmentGroup { changes { name delta quantityAfterChange } }
          userErrors { field message }
        }
      }`;

    const variables = {
      input: {
        name: "available",
        reason: input.reason ?? "other",
        referenceDocumentUri: input.referenceDocumentUri,
        changes: [{
          inventoryItemId,
          locationId,
          delta: input.quantity
        }]
      }
    };

    const resp: any = await client.query({ data: { query: mutation, variables } });
    const err = resp?.body?.data?.inventoryAdjustQuantities?.userErrors?.[0];
    if (err) throw new BadRequestException(err.message);

    const qAfter =
      resp?.body?.data?.inventoryAdjustQuantities?.inventoryAdjustmentGroup?.changes?.[0]?.quantityAfterChange;

    return { sku: input.sku, locationName: input.locationName ?? '', locationId, inventoryItemId, quantity: qAfter ?? 0 };
  }

  async deactivate(input: Pick<InventoryPostInput, 'sku'|'locationId'|'locationName'>): Promise<{ ok: boolean }> {
    const client = this.getGraphql();
    const locationId = input.locationId ?? await this.getLocationIdByName(input.locationName!);
    const inventoryItemId = await this.getInventoryItemIdBySku(input.sku);
    const levelId = await this.getInventoryLevelId(inventoryItemId, locationId);
    if (!levelId) throw new BadRequestException(`Inventory level not found for SKU "${input.sku}" at the specified location`);

    const mutation = `
      mutation Deactivate($inventoryLevelId: ID!) {
        inventoryDeactivate(inventoryLevelId: $inventoryLevelId) {
          userErrors { field message }
        }
      }`;

    const resp: any = await client.query({ data: { query: mutation, variables: { inventoryLevelId: levelId } } });
    const err = resp?.body?.data?.inventoryDeactivate?.userErrors?.[0];
    if (err) throw new BadRequestException(err.message);
    return { ok: true };
  }
}
@ApiHeader({ name: 'api-key', description: 'API Key for authentication', required: true })
@Controller('inventory')
export class InventoryRestController {
  private readonly access: InventoryDataAccess;
  constructor(private readonly shopifyService: ShopifyService, private readonly config: ConfigService) {
    this.access = new InventoryDataAccess(shopifyService, config);
  }

  @Get()
  async getAll() {
    const rows = await this.access.fetchAll();
    return rows.map(r => ({
      name: 'inventory',
      foreignKeys: [
        { table: 'product_variants', fields: { sku: r.sku } },
        { table: 'locations', fields: { locationName: r.locationName } },
      ],
      fields: [
        { name: 'sku', type: 'string', primary: true, value: r.sku },
        { name: 'locationName', type: 'string', primary: true, value: r.locationName },
        { name: 'locationId', type: 'string', value: r.locationId },
        { name: 'inventoryItemId', type: 'string', value: r.inventoryItemId },
        { name: 'quantity', type: 'number', value: r.quantity },
      ],
    }));
  }

  @Get(':sku')
  async getBySku(@Param('sku') sku: string) {
    const rows = await this.access.fetchBySku(sku);
    return rows.map(r => ({
      name: 'inventory',
      foreignKeys: [
        { table: 'product_variants', fields: { sku: 'sku' } },
        { table: 'locations', fields: { locationName: 'name' } },
      ],
      fields: [
        { name: 'sku', type: 'string', primary: true, value: r.sku },
        { name: 'locationName', type: 'string', primary: true, value: r.locationName },
        { name: 'locationId', type: 'string', value: r.locationId },
        { name: 'inventoryItemId', type: 'string', value: r.inventoryItemId },
        { name: 'quantity', type: 'number', value: r.quantity },
      ],
    }));
  }

  @Post()
  async postActivate(@Body() body: InventoryPostInput) {
    console.log(body.sku);
    if (!body.sku) throw new BadRequestException('sku is required');
    if (!body.locationId && !body.locationName) throw new BadRequestException('locationId or locationName is required');

    const res = await this.access.activate(body);
    return {
      name: 'inventory',
      foreignKeys: [
        { table: 'product_variants', fields: { sku: 'sku' } },
        { table: 'locations', fields: { locationName: 'name' } },
      ],
      fields: [
        { name: 'sku', type: 'string', primary: true, value: res.sku },
        { name: 'locationName', type: 'string', primary: true, value: res.locationName },
        { name: 'locationId', type: 'string', value: res.locationId },
        { name: 'inventoryItemId', type: 'string', value: res.inventoryItemId },
        { name: 'quantity', type: 'number', value: res.quantity },
      ],
    };
  }

  @Put()
  async putSet(@Body() body: InventoryPostInput) {
    if (!body.sku) throw new BadRequestException('sku is required');
    if (!body.locationId && !body.locationName) throw new BadRequestException('locationId or locationName is required');
    if (typeof body.quantity !== 'number') throw new BadRequestException('quantity must be a number');

    const res = await this.access.setAvailableQuantity(body);
    return {
      name: 'inventory',
      foreignKeys: [
        { table: 'product_variants', fields: { sku: 'sku' } },
        { table: 'locations', fields: { locationName: 'name' } },
      ],
      fields: [
        { name: 'sku', type: 'string', primary: true, value: res.sku },
        { name: 'locationName', type: 'string', primary: true, value: res.locationName },
        { name: 'locationId', type: 'string', value: res.locationId },
        { name: 'inventoryItemId', type: 'string', value: res.inventoryItemId },
        { name: 'quantity', type: 'number', value: res.quantity },
      ],
    };
  }

  @Patch()
  async patchAdjust(@Body() body: InventoryPostInput) {
    if (!body.sku) throw new BadRequestException('sku is required');
    if (!body.locationId && !body.locationName) throw new BadRequestException('locationId or locationName is required');
    if (typeof body.quantity !== 'number') throw new BadRequestException('quantity must be a number (delta)');

    const res = await this.access.adjustAvailableQuantity(body);
    return {
      name: 'inventory',
      foreignKeys: [
        { table: 'product_variants', fields: { sku: 'sku' } },
        { table: 'locations', fields: { locationName: 'name' } },
      ],
      fields: [
        { name: 'sku', type: 'string', primary: true, value: res.sku },
        { name: 'locationName', type: 'string', primary: true, value: res.locationName },
        { name: 'locationId', type: 'string', value: res.locationId },
        { name: 'inventoryItemId', type: 'string', value: res.inventoryItemId },
        { name: 'quantity', type: 'number', value: res.quantity },
      ],
    };
  }

  @Delete()
  async deleteDeactivate(@Body() body: { sku: string; locationId?: string; locationName?: string }) {
    if (!body?.sku) throw new BadRequestException('sku is required');
    if (!body.locationId && !body.locationName) throw new BadRequestException('locationId or locationName is required');

    const out = await this.access.deactivate(body);
    return { ok: out.ok };
  }
}

@Resolver(() => Inventory)
export class InventoryResolver {
  private readonly access: InventoryDataAccess;
  constructor(private readonly shopifyService: ShopifyService, private readonly config: ConfigService) {
    this.access = new InventoryDataAccess(shopifyService, config);
  }

  @Query(() => [Inventory], { name: 'inventory' })
  async inventory(): Promise<Inventory[]> {
    return this.access.fetchAll();
  }

  @Query(() => [Inventory], { name: 'inventoryBySku' })
  async inventoryBySku(@Args('sku') sku: string): Promise<Inventory[]> {
    return this.access.fetchBySku(sku);
  }

  @Mutation(() => Inventory, { name: 'activateInventory' })
  async activateInventory(@Args('input') input: InventoryPostInput): Promise<Inventory> {
    return this.access.activate(input);
  }

  @Mutation(() => Inventory, { name: 'setInventory' })
  async setInventory(@Args('input') input: InventoryPostInput): Promise<Inventory> {
    return this.access.setAvailableQuantity(input);
  }

  @Mutation(() => Inventory, { name: 'adjustInventory' })
  async adjustInventory(@Args('input') input: InventoryPostInput): Promise<Inventory> {
    return this.access.adjustAvailableQuantity(input);
  }

  @Mutation(() => Boolean, { name: 'deactivateInventory' })
  async deactivateInventory(@Args('input') input: InventoryPostInput): Promise<boolean> {
    const res = await this.access.deactivate(input);
    return res.ok;
  }
}
