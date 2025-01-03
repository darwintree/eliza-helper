import { ethers } from "ethers"
import MEMEMULTICALL from "./abi/MEMEMULTICALL"
import MEMEABI from "./abi/meme"
import dotenv from "dotenv"

dotenv.config()

export const MemeSupply = 1_000_000_000n;
export const MemeSupplyUnitForPerc = MemeSupply * BigInt(10 ** 16); // 由于计算百分百比，会减少2位，原本18

interface TokenInfo {
    circulatingSupply: bigint
    reserve: bigint
    dexSupplyThresh: bigint
    price: bigint
    r: bigint
    status: number
    tokenVersion: number
    progress: number
    boundedProgress: number
}

export async function getTokensInfo(address: `0x${string}`[]): Promise<TokenInfo[]> {
    const rpcUrl = process.env.RPC_URL
    if (!rpcUrl) {
        throw new Error("RPC_URL is not set")
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    const multicallAddress = process.env.MULTICALL_ADDRESS
    if (!multicallAddress) {
        throw new Error("MULTICALL_ADDRESS is not set")
    }
    const memeAddress = process.env.MEME_ADDRESS
    if (!memeAddress) {
        throw new Error("MEME_ADDRESS is not set")
    }

    const memeContract = new ethers.Contract(memeAddress, MEMEABI, provider)
    const multicallContract = new ethers.Contract(multicallAddress, MEMEMULTICALL, provider)

    const calls = address.map((addr) => ({
        target: memeAddress,
        callData: memeContract.interface.encodeFunctionData("getTokenV2", [addr])
    }))

    const allReturnData = await multicallContract.aggregate.staticCall(calls)

    const returnData = allReturnData[1]

    const decodedResults: TokenInfo[] = returnData.map((data: string) => {
        const decoded = memeContract.interface.decodeFunctionResult("getTokenV2", data)[0]
        return {
            status: decoded[0],
            reserve: decoded[1],
            circulatingSupply: decoded[2],
            price: decoded[3],
            tokenVersion: decoded[4],
            r: decoded[5],
            dexSupplyThresh: decoded[6],
        } as TokenInfo
    })

    for (const tokenInfo of decodedResults) {
        tokenInfo.progress = Number(tokenInfo.circulatingSupply) / Number(MemeSupplyUnitForPerc)
        tokenInfo.boundedProgress = tokenInfo.progress > 80 ? 100 : tokenInfo.progress
    }

    return decodedResults
}