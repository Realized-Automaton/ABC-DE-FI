/**
 * Represents a token with its symbol and address.
 */
export interface Token {
  /**
   * The symbol of the token (e.g., CLASS, XP).
   */
  symbol: string;
  /**
   * The address of the token on the blockchain.
   */
  address: string;
}

/**
 * Asynchronously retrieves a list of available tokens.
 *
 * @returns A promise that resolves to an array of Token objects.
 */
export async function getAvailableTokens(): Promise<Token[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      symbol: 'CLASS',
      address: '0x0000000000000000000000000000000000000001',
    },
    {
      symbol: 'XP',
      address: '0x0000000000000000000000000000000000000002',
    },
  ];
}
