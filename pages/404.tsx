export default function Error404() {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-800 items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h1 className="text-6xl text-gray-800 font-black tracking-wider text-center pb-6">
          Glana
        </h1>
        <h1 className="text-xl font-semibold mb-4 text-center">
          The page you&rsquo;re looking for could not be found.
        </h1>
        <div className="mt-4">
          <span className="text-gray-700">
            Go back to the{" "}
            <a href="/" className="text-primary">
              homepage
            </a>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
