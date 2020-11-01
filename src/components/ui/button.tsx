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
      className="p-1 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-inner shadow-lg block rounded font-sm"
      onClick={props.onClick}
    >
      <div className="w-10 h-10">{iconComponent(props.icon)}</div>
    </a>
  );
};

export default Button;
