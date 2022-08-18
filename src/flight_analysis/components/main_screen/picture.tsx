import { Picture as PictureModel } from "../../store/models/flight_datum";

interface Props {
  picture: PictureModel;
  onClose: (picture: PictureModel) => void;
}

export default function Picture(props: Props) {
  const { picture, onClose } = props;

  return (
    <div
      onClick={() => onClose(picture)}
      className="absolute h-full w-full top-0 left-0 z-10 flex flex-row justify-center items-center cursor-pointer"
    >
      <div className="absolute top-0 left-0 h-full w-full opacity-50 bg-gray-800" />
      <div className="relative max-h-full max-w-full">
        <img
          src={picture.url}
          alt={picture.title || "In-flight picture"}
          className="block"
        />
        {picture.title && (
          <div className="absolute top-0 left-0 h-12 w-full bg-gray-700 bg-opacity-30 text-white text-ellipsis text-lg overflow-hidden flex flex-nowrap justify-center items-center">
            {picture.title}
          </div>
        )}
      </div>
    </div>
  );
}
