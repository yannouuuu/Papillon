import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, {
  AnimatedStyle,
  FadeInDown,
  FadeOutUp,
  LinearTransition
} from "react-native-reanimated";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

const AnimatedNbr = ({ value, style, contentContainerStyle }: {
  value: string;
  style: StyleProp<TextStyle>
  contentContainerStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}) => {
  return (
    <Reanimated.View
      style={[{
        flexDirection: "row",
        alignItems: "flex-end",
        overflow: "hidden",
        paddingHorizontal: 3,
        marginHorizontal: -5,
        paddingVertical: 2,
        marginVertical: -2,
      }, contentContainerStyle]}
      layout={animPapillon(LinearTransition)}
    >
      {value.split("").map((n, i) => (
        <Reanimated.View
          key={i + "_" + n}
          entering={animPapillon(FadeInDown).delay(i * 20)}
          exiting={animPapillon(FadeOutUp).delay(i * 30)}
          layout={animPapillon(LinearTransition)}
        >
          <NativeText style={[style]}>
            {n}
          </NativeText>
        </Reanimated.View>
      ))}
    </Reanimated.View>
  );
};

export default AnimatedNbr;