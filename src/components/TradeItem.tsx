"use client";

import { useRouter } from "next/navigation";
import { useUserProfileByUid } from "@/lib/hooks";
import { timeSince } from "src/lib/utils";

interface TradeProps {
  trade: {
    uid: string;
    subject: string;
    trader: string;
    type: string;
    amount: number;
    timestamp: any;
  };
}

const Trade = ({ trade }: TradeProps) => {
  const router = useRouter();

  const { userProfile: subjectProfile } = useUserProfileByUid(trade.subject);
  const { userProfile: traderProfile } = useUserProfileByUid(trade.trader);

  const onGoToUserProfile = (uid: string | null) => {
    if (uid) {
      router.push(`/private/profile/${uid}`);
    }
  };

  return (
    <div className="p-2" data-testid="trade-container">
      <div className="flex" data-testid="trade-usernames">
        <p
          className="text-black font-regular cursor-pointer hover:text-gray-600"
          data-testid="trader-username"
          onClick={() => onGoToUserProfile(trade.trader)}
        >
          @{traderProfile?.username}
        </p>
        <p
          className={`${
            trade.type === "buy" ? "text-green-600" : "text-red-600"
          } font-regular`}
          data-testid="trade-action"
        >
          {trade.type === "buy" ? "compró" : "vendió"}
        </p>
        <p
          className="text-black font-regular ml-1 cursor-pointer hover:text-gray-600"
          data-testid="subject-username"
          onClick={() => onGoToUserProfile(trade.subject)}
        >
          @{subjectProfile?.username}
        </p>
      </div>

      <div className="flex" data-testid="trade-details">
        <p
          className={`${
            trade.type === "buy" ? "text-green-600" : "text-red-600"
          } font-regular mr-1`}
          data-testid="trade-type"
        >
          {trade.type === "buy" ? "compró" : "vendió"}
        </p>
        <p className="text-black font-regular font-thin mr-1" data-testid="trade-for">
          por
        </p>
        <p
          className={`font-regular ${
            trade.type === "buy" ? "text-green-600" : "text-red-600"
          } mr-1`}
          data-testid="trade-amount"
        >
          {trade.amount} USDT
        </p>
        <p className="text-black font-regular font-thin" data-testid="trade-timestamp">
          hace {timeSince(trade.timestamp.seconds)}
        </p>
      </div>
    </div>
  );
};

export default Trade;
