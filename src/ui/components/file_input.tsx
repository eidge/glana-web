import { ButtonStyle, Props as ButtonProps } from "./button";

interface Props extends ButtonProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileInput(props: Props) {
  const { onChange, ...buttonProps } = props;
  return (
    <ButtonStyle
      element="label"
      {...buttonProps}
      attributes={{ style: { maxWidth: "100%" } }}
    >
      <input
        className="invisible w-0"
        type="file"
        multiple={true}
        onChange={onChange}
      />
    </ButtonStyle>
  );
}
