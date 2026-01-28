// GraphQL tag function for better syntax highlighting
const gql = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.reduce((result, string, i) => {
    return result + string + (values[i] || '');
  }, '');
};

export const productsCountQuery = gql`
  query productsCount {
    productsCount {
      count
    }
  }
`;

export const productQuery = gql`
  query product($id: ID!) {
    product(id: $id) {
      id
      title
      descriptionHtml
      vendor
      productType
      handle
      createdAt
      updatedAt
      publishedAt
      tags
      status
    }
  }
`;

export const productsQuery = gql`
  query products($limit: Int, $cursor: String) {
    products(first: $limit, after: $cursor) {
      edges {
        node {
          id
          title
          descriptionHtml
          vendor
          productType
          handle
          createdAt
          updatedAt
          publishedAt
          tags
          status
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const locationsCountQuery = gql`
  query locationsCount {
    locationsCount {
      count
    }
  }
`;

export const locationsQuery = gql`
  query locations($limit: Int, $cursor: String) {
    locations(first: $limit, after: $cursor, includeInactive: true, includeLegacy: true) {
      edges {
        node {
          id
          name
          isActive
          createdAt
          updatedAt
          address {
            address1
            address2
            city
            province
            provinceCode
            phone
            country
            countryCode
            zip
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;