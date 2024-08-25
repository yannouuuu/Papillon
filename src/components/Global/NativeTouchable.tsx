import { Platform, TouchableHighlight, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";

const NativeTouchable = ({ children, ...props }) => {
  if(Platform.OS === "android") {
    return (
      <TouchableNativeFeedback {...props}>
        <View
          style={props.style}
        >
          {children}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableHighlight
      underlayColor={"rgba(0, 0, 0, 0.1)"}
      {...props}>
      {children}
    </TouchableHighlight>
  );
};

export default NativeTouchable;