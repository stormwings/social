"use client";

import { useForm, Controller } from "react-hook-form";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { useUserData, useUsdtBalance, useWithdraw } from "@/lib/hooks";

import TopbarMedia from "@/components/TopbarMedia";

type Inputs = {
  address: string;
  amount: number;
};

export default function WithdrawPage() {
  const { user, ethereumAddress } = useUserData();
  const usdtBalance = useUsdtBalance({ ethereumAddress });
  const { withdraw, isProcessing } = useWithdraw(user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<Inputs>();

  return (
    <div className="min-h-screen">
      <TopbarMedia title="Withdraw" showBack />
      <div className="max-w-sm mx-auto">
        <div className="mb-8 mt-16">
          <label
            className="flex items-center text-gray-600 font-medium mb-2"
            htmlFor="destinationAddress"
          >
            Destination Address
          </label>
          <input
            id="destinationAddress"
            {...register("address", {
              required: "Withdraw address is required",
            })}
            type="text"
            className="w-full p-2 mb-1 text-gray-900 border-2 border-gray-300 rounded-lg placeholder-gray-400"
            placeholder={"0xF7E44b4..."}
            disabled={!user}
          />
          {errors.address && (
            <p className="text-red-500">{errors.address.message}</p>
          )}
          <p className="flex items-center text-gray-500 mb-6 text-xs">
            <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
            This address must be compatible with USDT
          </p>
        </div>

        <form onSubmit={handleSubmit(withdraw)}>
          <div className="mb-4">
            <label
              className="flex items-center text-gray-600 font-medium mb-2"
              htmlFor="amount"
            >
              Amount to withdraw
            </label>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: "Amount is required",
                validate: (value) =>
                  (value && usdtBalance && value <= parseFloat(usdtBalance)) ||
                  "Insufficient balance",
              }}
              render={({ field }) => (
                <input
                  {...field}
                  id="amount"
                  type="number"
                  className="w-full p-2 mb-1 text-gray-900 border-2 border-gray-300 rounded-lg placeholder-gray-400"
                  disabled={!user}
                  placeholder="0.00"
                />
              )}
            />
            {errors.amount && (
              <p className="text-red-500">{errors.amount.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {usdtBalance ? `Balance: ${usdtBalance} USDT` : "Loading..."}
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-600 text-white font-normal py-2 px-4 rounded-lg mb-4"
            disabled={!user || isProcessing}
          >
            {isProcessing ? <>Processing...</> : "Withdraw"}
          </button>
        </form>
      </div>
    </div>
  );
}
