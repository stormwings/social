import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { logger } from "@/lib/logger";

type Trade = {
  uid: string;
};

type UseTradesConfigType = {
  user: any;
  userKeys: string[];
  initialFilter: string;
};

export const useTrades = ({
  user,
  userKeys,
  initialFilter,
}: UseTradesConfigType) => {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (userKeys.length > 0 && user) {
      let q;
      const tradesRef = collection(db, "trades");

      try {
        switch (filter) {
          case "userKeys":
            if (userKeys.length === 0) return;
            q = query(
              tradesRef,
              where("subject", "in", userKeys),
              orderBy("timestamp", "desc")
            );
            break;
          case "yourKey":
            q = query(
              tradesRef,
              where("subject", "==", user.uid),
              orderBy("timestamp", "desc")
            );
            break;
          case "allTrades":
            q = query(tradesRef, orderBy("timestamp", "desc"));
            break;
          default:
            return;
        }

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const newTrades = querySnapshot.docs.map((doc) => doc.data() as Trade);
            setTrades(newTrades);
          },
          (error) => {
            logger.error("Error fetching trades", error, { filter });
            toast.error("Failed to load trades");
          }
        );

        return () => unsubscribe();
      } catch (error) {
        logger.error("Error setting up trades query", error, { filter });
        toast.error("Failed to load trades");
      }
    }
  }, [filter, userKeys, user]);

  return { trades, filter, setFilter };
};
