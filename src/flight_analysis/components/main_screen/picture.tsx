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
      className="absolute h-full w-full top-0 left-0"
    >
      <div className="absolute top-0 left-0 h-full w-full opacity-50 bg-gray-800" />
      <img
        src={picture.url}
        alt={picture.title || "In-flight picture"}
        className="relative z-10 mx-auto h-full"
      />
    </div>
  );
}
