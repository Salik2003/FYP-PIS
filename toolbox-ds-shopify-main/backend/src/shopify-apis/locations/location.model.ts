import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Location {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true }) address1?: string;
  @Field({ nullable: true }) address2?: string;
  @Field({ nullable: true }) city?: string;
  @Field({ nullable: true }) country?: string;
  @Field({ nullable: true }) country_code?: string;
  @Field({ nullable: true }) created_at?: string;
  @Field({ nullable: true }) legacy?: boolean;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) province?: string;
  @Field({ nullable: true }) province_code?: string;
  @Field({ nullable: true }) updated_at?: string;
  @Field({ nullable: true }) zip?: string;
}
