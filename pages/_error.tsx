export default function Error() {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-800 items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h1 className="text-6xl text-gray-800 font-black tracking-wider text-center pb-6">
          Glana
        </h1>
        <h1 className="text-xl font-semibold mb-4 text-center">
          Flight could not be loaded.
        </h1>
        <div className="mt-4">
          <span className="text-gray-700">
            You can manually upload a flight{" "}
            <a href="/" className="text-primary">
              here
            </a>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
