import { ApolloClient, InMemoryCache } from "@apollo/client";
import { gql } from "@apollo/client";

export interface SubgraphConfig {
    url: string;
}


export interface TokenCreated {
    ts: string;
    creator: string;
    token: `0x${string}`;
    name: string;
    symbol: string;
    meta: string;
}

export interface TokenTransaction {
    id: string;
    ts: string;
    eth: string;
    amount: string;
    postPrice: string;
    token: string;
}

export interface TokenBought extends TokenTransaction {
    buyer: string;
}

export interface TokenSold extends TokenTransaction {
    seller: string;
}

export interface TokenTransactionsResponse {
    tokenBoughts: TokenBought[];
    tokenSolds: TokenSold[];
}

export interface ParsedTokenCreated extends Omit<TokenCreated, "meta"> {
    meta: {
        description: string;
        image: string;
        website: string | null;
        x: string | null;
        telegram: string | null;
    };
}

export function parseMetadata(metaString: string) {
    try {
      const metaData = JSON.parse(metaString);
      return {
        description: metaData.description || "",
        image: metaData.image || metaString || "",
        website: metaData.website || null,
        x: metaData.x || null,
        telegram: metaData.telegram || null,
      };
    } catch {
      return {
        description: "",
        image: metaString || "",
      };
    }
  } 

export const initApolloClient = async (config: SubgraphConfig) => {
    return new ApolloClient({
        uri: config.url,
        cache: new InMemoryCache(),
    });
};


export async function getTokenCreateds(
    config: SubgraphConfig,
    creator?: string
): Promise<ParsedTokenCreated[]> {
    const client = await initApolloClient(config);
    const GET_TOKEN_DATA = gql`
      query GetTokenData($creator: String) {
        tokenCreateds(where: ${creator ? "{ creator: $creator }" : "{}"}) {
          ts
          creator
          token
          name
          symbol
          meta
        }
      }
    `;

    const response = await client.query({
        query: GET_TOKEN_DATA,
        variables: creator ? { creator } : undefined,
        fetchPolicy: "network-only",
    });

    const parsed = response.data.tokenCreateds.map((token: TokenCreated) => ({
        ...token,
        meta: parseMetadata(token.meta),
    }));
    return parsed;
}


export async function getTokenTransactions(
    config: SubgraphConfig,
    tokenAddress: string,
    first: number = 1000,
    skip: number = 0
): Promise<TokenTransactionsResponse> {
    const client = await initApolloClient(config);
    const GET_TOKEN_DATA = gql`
        query GetTokenData($tokenAddress: String!, $first: Int!, $skip: Int!) {
            tokenBoughts(
                first: $first
                skip: $skip
                where: { token: $tokenAddress }
            ) {
                id
                ts
                eth
                amount
                postPrice
                buyer
                token
            }
            tokenSolds(
                first: $first
                skip: $skip
                where: { token: $tokenAddress }
            ) {
                id
                ts
                eth
                amount
                postPrice
                seller
                token
            }
        }
    `;

    const response = await client.query({
        query: GET_TOKEN_DATA,
        variables: { tokenAddress, first, skip },
        fetchPolicy: "network-only",
    });

    return response.data;
}
