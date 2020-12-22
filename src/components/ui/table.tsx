import { ReactNode } from "react";

interface SharedProps {
  children: ReactNode;
  className?: string;
}

const px = "px-6";

function tableGlobalCSS() {
  return (
    <style global jsx>
      {`
        .gl-table {
          @apply border-collapse table-auto w-full bg-white relative rounded;
        }

        .gl-table tr:first-child td:first-child,
        .gl-table tr:first-child th:first-child {
          @apply rounded-tl;
        }

        .gl-table tr:last-child td:last-child,
        .gl-table tr:last-child th:last-child {
          @apply rounded-tr;
        }
      `}
    </style>
  );
}

function withPropsClass(props: SharedProps, extraClasses: string) {
  if (!props.className) return extraClasses;
  return `${props.className} ${extraClasses}`;
}

export function Table(props: SharedProps) {
  return (
    <table className={withPropsClass(props, "gl-table")}>
      {props.children}
      {tableGlobalCSS()}
    </table>
  );
}

export function Head(props: SharedProps) {
  return <thead className={withPropsClass(props, "")}>{props.children}</thead>;
}

export function HeadRow(props: SharedProps) {
  return (
    <tr className={withPropsClass(props, "text-left")}>{props.children}</tr>
  );
}

export function HeadCell(props: SharedProps) {
  return (
    <th
      className={withPropsClass(
        props,
        `py-2 ${px} border-b border-gray-200 bg-primary text-white`
      )}
    >
      {props.children}
    </th>
  );
}

export function Body(props: SharedProps) {
  return <tbody className={withPropsClass(props, "")}>{props.children}</tbody>;
}

interface RowProps extends SharedProps {
  onMouseOver?: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
}

export function Row(props: RowProps) {
  return (
    <tr
      onMouseOver={props.onMouseOver}
      className={withPropsClass(
        props,
        "text-left text-gray-700 border-dashed border-t border-gray-200 hover:bg-gray-100"
      )}
    >
      {props.children}
    </tr>
  );
}

export function Cell(props: SharedProps) {
  return (
    <td className={withPropsClass(props, `${px} py-3`)}>{props.children}</td>
  );
}
