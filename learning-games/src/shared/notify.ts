export function notify(message: string) {
  if (typeof window !== 'undefined') {
    alert(message);
  } else {
    console.log(message);
  }
}
