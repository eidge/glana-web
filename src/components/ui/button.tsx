import * as icons from "./icons";

type iconKey = keyof typeof icons;

interface Props {
  icon?: iconKey;
  onClick: () => void;
}

let iconComponent = (iconKey?: iconKey) => {
  if (!iconKey) return null;
  let IconComponent = icons[iconKey];
  return <IconComponent />;
};

const Button = (props: Props) => {
  return (
    <a
      href="#"
      className="p-1 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-inner shadow-md block rounded font-sm p-2"
      onClick={props.onClick}
    >
      <div className="w-8 h-8">{iconComponent(props.icon)}</div>
    </a>
  );
};

export default Button;
