import Link from "next/link";
import { useUserProfileByUid, useBuyPrice } from "@/lib/hooks";
import { timeSince } from "src/lib/utils";
import ProfilePicture from "./ProfilePicture";

interface IKeyListItemProps {
  keyId: string;
}

export default function KeyListItem({ keyId }: IKeyListItemProps) {
  const { userProfile } = useUserProfileByUid(keyId);
  const buyPrice = useBuyPrice({ ethereumAddress: userProfile?.ethereumAddress });

  if (!userProfile) return null;

  return (
    <Link href={`/private/profile/${keyId}`} passHref>
      <div className="flex items-center space-x-4 p-4" data-testid={`profile-link-${keyId}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden" data-testid="profile-picture-container">
          <ProfilePicture userAddress={userProfile.ethereumAddress} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg" data-testid="username">{userProfile.username}</h2>
              <p className="text-gray-500 text-sm" data-testid="user-info">
                Desde hace {timeSince(userProfile.createdAt?.seconds)}
              </p>
              <p className="text-gray-500 text-sm" data-testid="user-holders">
                {`${userProfile.holders} ${userProfile.holders === 1 ? "holder" : "holders"}`}
              </p>
            </div>
            <div className="font-light text-sm" data-testid="buy-price">{buyPrice} USDT</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
