export function Loading({ text = "Loading..." }) {
  return <div className="status">{text}</div>;
}
export function ErrorBox({ message }) {
  return message ? <div className="error">{message}</div> : null;
}
