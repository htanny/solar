import { useState, useRef, useEffect } from "react";

/* Collapse the useState + useRef + useEffect(sync) trio into one declaration.
   Returns [state, setState, ref] where ref.current always mirrors state. */
export function useRefSync(initialValue) {
  var [state, setState] = useState(initialValue);
  var ref = useRef(initialValue);
  useEffect(function () { ref.current = state; }, [state]);
  return [state, setState, ref];
}
