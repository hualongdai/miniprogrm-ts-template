interface BasePage extends WechatMiniprogram.Page.InstanceMethods<WechatMiniprogram.Page.DataOption> {

}

class BasePage implements WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption> {
  constructor() {
    // @ts-ignore
    delete this.__proto__.constructor
  }
}

export default BasePage;