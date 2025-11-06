"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { useUserData, useUsdtBalance, useBuyPrice } from "@/lib/hooks";
import { handleBuyKey } from "src/services/trade.service";

interface BuyKeyModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  keyAddress: string;
  subjectUID: string;
}

export function BuyKeyModal({
  isOpen,
  setIsOpen,
  keyAddress,
  subjectUID,
}: BuyKeyModalProps) {
  const [numberOfKeys, setNumberOfKeys] = useState(1);
  const { userData, user, ethereumAddress } = useUserData();

  const usdtBalance = useUsdtBalance({ ethereumAddress });
  const buyPrice = useBuyPrice({ ethereumAddress: keyAddress });

  const [isProcessing, setIsProcessing] = useState(false);

  const onConfirmBuyKey = async () => {
    if (!ethereumAddress) return;

    setIsProcessing(true);

    await handleBuyKey({
      user,
      ethereumAddress,
      subjectUID,
      numberOfKeys,
      useWallet: userData?.isWallet,
    });

    setIsProcessing(false);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setIsOpen(false)}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center">
            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  onClick={() => setIsOpen(false)}
                  data-testid="close-button"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start mb-4">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title
                    className="text-base font-semibold text-gray-900"
                    data-testid="dialog-title"
                  >
                    Buy Key
                  </Dialog.Title>
                  <div className="mt-2">
                    <p
                      className="text-sm text-gray-500"
                      data-testid="key-address"
                    >
                      Address: {keyAddress}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      data-testid="buy-price"
                    >
                      Key price: {buyPrice} USDT
                    </p>
                    <p
                      className="text-sm text-gray-500 mb-4"
                      data-testid="stablecoin-balance"
                    >
                      USDT Balance: {usdtBalance} USDT
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setNumberOfKeys((prev) => Math.max(1, prev - 1))
                        }
                        className="px-3 py-1 text-gray-500 bg-gray-200 rounded-md"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold">
                        {numberOfKeys}
                      </span>
                      <button
                        onClick={() => setNumberOfKeys((prev) => prev + 1)}
                        className="px-3 py-1 text-gray-500 bg-gray-200 rounded-md"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isProcessing}
                  className="inline-flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 sm:ml-3 sm:w-auto"
                  onClick={onConfirmBuyKey}
                  data-testid="complete-buy-button"
                >
                  {isProcessing ? <>{"Processing..."}</> : "Complete Purchase"}
                </button>
                {!isProcessing && (
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setIsOpen(false)}
                    data-testid="cancel-button"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default BuyKeyModal;
