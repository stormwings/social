import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  usersKeysAddress,
  RPC_ENDPOINT,
  usdtAddress as USDT_CONTRACT_ADDRESS,
} from "@/lib/dappParams";
import { logger } from "@/lib/logger";
import usersKeysAbi from "../usersKeysAbi";

export const useKeyCount = ({
  ethereumAddress,
  subjectEthereumAddress,
}: any) => {
  const [keyCount, setKeyCount] = useState(null);

  useEffect(() => {
    if (ethereumAddress && subjectEthereumAddress) {
      const fetchKeyCount = async () => {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const usersKeysCContract = new ethers.Contract(
          usersKeysAddress,
          usersKeysAbi,
          provider
        );

        try {
          // I assume the `keysBalance` function gives the count of keys for a specific address
          // And let's also assume keysSubject is the address that represents the type of key.
          const userKeyCount = await usersKeysCContract.keysBalance(
            subjectEthereumAddress,
            ethereumAddress
          ); // Replace KEYS_SUBJECT_ADDRESS with actual address or logic
          setKeyCount(userKeyCount.toString()); // Convert BigNumber to string
        } catch (error) {
          logger.error("Error fetching key count", error, { ethereumAddress, subjectEthereumAddress });
          toast.error("Failed to fetch key count");
        }
      };

      fetchKeyCount();
    }
  }, [ethereumAddress, subjectEthereumAddress]);

  return keyCount;
};

export const useBuyPrice = ({ ethereumAddress }: any) => {
  const [buyPrice, setBuyPrice] = useState<string | null>(null);

  useEffect(() => {
    if (!ethereumAddress) return;
    async function fetchBuyPrice() {
      const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
      const contract = new ethers.Contract(
        usersKeysAddress,
        usersKeysAbi,
        provider
      );

      try {
        const price = await contract.getBuyPrice(ethereumAddress, 1);
        setBuyPrice(ethers.formatEther(price)); // Convert Wei to Ether for display
      } catch (error) {
        setBuyPrice("- ");
        logger.error("Error fetching buy price", error, { ethereumAddress });
      }
    }
    fetchBuyPrice();
  }, [ethereumAddress]);

  return buyPrice;
};

export const useUsdtBalance = ({ ethereumAddress }: any) => {
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!ethereumAddress) return;
    let mounted = true;

    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const contract = new ethers.Contract(
          USDT_CONTRACT_ADDRESS,
          [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
          ],
          provider
        );

        const dec = Number(await contract.decimals());
        const update = async () => {
          try {
            const raw = await contract.balanceOf(ethereumAddress);
            if (mounted) setUsdtBalance(ethers.formatUnits(raw, dec));
          } catch (error) {
            logger.error("Error updating USDT balance", error, { ethereumAddress });
          }
        };

        await update();
        const id = setInterval(update, 5000);
        return () => { mounted = false; clearInterval(id); };
      } catch (error) {
        logger.error("Error fetching USDT balance", error, { ethereumAddress });
        toast.error("Failed to fetch USDT balance");
      }
    })();
  }, [ethereumAddress]);

  return usdtBalance;
};

export const useSellPrice = (keyAddress: string, numberOfKeys: number) => {
  const [sellPrice, setSellPrice] = useState<string | null>(null);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    async function fetchSellPrice() {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
        const contract = new ethers.Contract(
          usersKeysAddress,
          usersKeysAbi,
          provider
        );

        const price = await contract.getSellPrice(keyAddress, numberOfKeys);
        setSellPrice(ethers.formatEther(price));
        setAlert("");
      } catch (error) {
        setAlert("You don't have enough keys to sell");
        logger.error("Error fetching sell price", error, { keyAddress, numberOfKeys });
      }
    }

    fetchSellPrice();
  }, [keyAddress, numberOfKeys]);

  return { sellPrice, alert };
};
