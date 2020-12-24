import Icon from "../../ui/components/icon";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center bg-gray-800">
      <h1 className="text-6xl text-gray-200 shadow-xl p-1 font-black tracking-wider">
        Glana
      </h1>
      <div className="text-gray-500 mt-5 animate-spin">
        <span className="inline-block mt-5 mr-5">
          <Icon icon="glider" size="lg" />
        </span>
      </div>
    </div>
  );
}
