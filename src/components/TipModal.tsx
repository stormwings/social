"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { ethers } from "ethers";

import { useUserData } from "@/lib/hooks";
import { usdtAddress as USDT_CONTRACT_ADDRESS } from "@/lib/dappParams";
import usdtTokenAbi from "src/usdtTokenAbi";

interface TipModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  recipientAddress: string;
}

export function TipModal({ isOpen, setIsOpen, recipientAddress }: TipModalProps) {
  const { ethereumAddress } = useUserData();
  const [tipAmount, setTipAmount] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);

  const sendTip = async () => {
    if (!ethereumAddress) return;

    setIsProcessing(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const USDTContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, usdtTokenAbi, signer);

      const tx = await USDTContract.transfer(recipientAddress, ethers.parseUnits(tipAmount, "ether"));
      await tx.wait();

      toast.success("Contribution sent successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Error sending the contribution.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment} data-testid="tip-modal">
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center">
            <Dialog.Panel
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
              data-testid="tip-dialog"
            >
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

              <Dialog.Title className="text-lg font-semibold text-gray-900" data-testid="dialog-title">
                Send Contribution
              </Dialog.Title>

              <div className="flex mt-2" data-testid="tip-amount-container">
                <input
                  type="number"
                  className="input input-bordered w-full max-w-xs"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  data-testid="tip-amount-input"
                />
                <span className="ml-2 text-gray-500">USDT</span>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  disabled={isProcessing}
                  className="inline-flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 sm:w-auto"
                  onClick={sendTip}
                  data-testid="send-tip-button"
                >
                  {isProcessing ? "Processing..." : "Send Contribution"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default TipModal;
