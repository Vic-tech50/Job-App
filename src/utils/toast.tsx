import { Easing } from "react-native";
import Toast from "react-native-toast-message";

type ToastMessage = {
  type: "success" | "error" | "info";
  title?: string;
  content: string;
};

export function ToastMess({ type, title, content }: ToastMessage) {
  return Toast.show({
    type: type,
    text1: title,
    text2: content,
    animationConfig: {
      enter: {
        type: "timing",
        duration: 200,
        easing: Easing.out(Easing.cubic),
      },
      exit: { type: "timing", duration: 400, easing: Easing.in(Easing.cubic) },
    },
  });
}
