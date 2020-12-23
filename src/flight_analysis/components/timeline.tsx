export default function Timeline() {
  const openInNewTab = () => {
    window.open("http://192.168.1.105:3000");
  };

  return (
    <div
      className="w-full h-32 bg-primary bg-opacity-20"
      onClick={openInNewTab}
    >
      Timeline
    </div>
  );
}
