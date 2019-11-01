class Component implements WechatMiniprogram.Component.Options<
  WechatMiniprogram.Component.DataOption,
  WechatMiniprogram.Component.PropertyOption,
  WechatMiniprogram.Component.MethodOption
> {}


export default class BaseComponent extends Component {
  externalClasses = ['bui-class'];

  properties = {
    buiStyle: {
      type: String,
      value: ''
    }
  }

}