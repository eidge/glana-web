/* eslint-disable @next/next/no-html-link-for-pages */
import FileInput from "../../ui/components/file_input";
import { useFlightAnalysisDispatch } from "../store";
import { actions } from "../store/actions";
import Icon from "../../ui/components/icon";
import { useState } from "react";
import Image from "next/image";
import IGCBlob from "../igc_blob";
import errorTracker from "../../error_tracker";
import Link from "next/link";

export default function UploadScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useFlightAnalysisDispatch();
  const onFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const flightData = await handleFileInput(event);
    if (flightData.length > 0) {
      dispatch(actions.closeDrawer());
      dispatch(actions.setFlightData(flightData));
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="text-xl mt-12 mb-12">
        View, analise and compare glider flights.
      </div>

      <FileInput
        size="lg"
        type="full"
        color="primary"
        className="px-6"
        icon="upload"
        text="Select flights to get started"
        isPressed={isLoading}
        onChange={onFileInput}
      />

      {isLoading && (
        <div className="text-gray-500 mt-5 animate-spin">
          <span className="inline-block mt-5 mr-5">
            <Icon icon="glider" size="lg" />
          </span>
        </div>
      )}

      <div className="my-6">or try one of the demos</div>

      <div className="flex flex-row space-x-6">
        <Link
          className="border border-white rounded mb-3 flex flex-col hover:border-primary overflow-hidden"
          href="/?igcUrl=%2Fdun1.igc,%2Fdun2.igc,%2Fdun3.igc"
        >
          <Image
            src="/dun_thumbnail.png"
            width={120}
            height={120}
            alt="Thumbnail for a flight in the UK"
          />
          <div className="py-2 bg-gray-800 font-bold text-gray-100 text-center">
            Multiple flights
            <br />
            United Kingdom
          </div>
        </Link>

        <Link
          className="border border-white rounded mb-3 flex flex-col hover:border-primary overflow-hidden"
          href="/?igcUrl=%2Fsa750.igc"
        >
          <Image
            src="/sa_thumbnail.png"
            width={120}
            height={120}
            alt="Thumbnail for a flight in South Africa"
          />
          <div className="py-2 bg-gray-800 font-bold text-gray-100 text-center">
            750 km
            <br />
            South Africa
          </div>
        </Link>
      </div>
    </div>
  );
}

async function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
  if (!event.target.files) return [];

  const files = Array.from(event.target.files) as Blob[];
  if (files.length < 1) return [];

  try {
    const igcBlob = new IGCBlob(files);
    return await igcBlob.toFlightData();
  } catch (e) {
    await errorTracker.report(e as any);
    return [];
  }
}
