
const PREFIX              = "data-mx-";
const LOCKED_STYLE_PREFIX = "locked-style-";

const ORDER_BY_INDEX      = "order-by-index";
const INDEX               = "index";
const KEEP                = "keep";
const LAYOUT_TABLE        = "layout-table";

class MxAttribute {

  constructor() {
    this.attr = {}
    this.attrLen = 0;
    this.lockedStyle = {}
    this.lockedStyleLen = 0;
  }


  // @param {Object} attr {:name, value}
  add(attr) {
    if (!MxAttribute.is(attr)) return;

    const mxAttrName = attr.name.substring(PREFIX.length);
    switch(mxAttrName) {
      case ORDER_BY_INDEX:
        this.attr.orderByIndex = true;
        this.attrLen++;
        break;
      case INDEX:
        this.attr.index = attr.value;
        this.attrLen++;
        break;
      case LAYOUT_TABLE:
        this.attr.layoutTable = true;
        this.attrLen++
        break;
      default: {
        if (mxAttrName.startsWith(LOCKED_STYLE_PREFIX)) {
          const propertyName = mxAttrName.substring(LOCKED_STYLE_PREFIX.length);
          this.lockedStyle[propertyName] = attr.value;
          this.lockedStyleLen++;
        } else {
          console.debug("Unknow maoxian attribute: ", attr.name);
        }
      }
    }
  }

  get exist() {
    return this.attrLen > 0 || this.lockedStyleLen > 0
  }

  // to a serializable object
  toObject() {
    let r = {};
    if (this.attrLen > 0) { r = this.attr }
    if (this.lockedStyleLen > 0) { r.lockedStyle = this.lockedStyle }
    return r;
  }



}

// Some maoxian attributes are useful in takeSnapshot process only (these can be ignore)
// others are useful after toHTML process (these must be keep)
MxAttribute.toHTMLAttrObject = (mxAttrObj) => {
  if(!mxAttrObj) { return {}}
  const r = {};
  if (mxAttrObj.hasOwnProperty('layoutTable')) {
    r[MxAttribute.LAYOUT_TABLE] = mxAttrObj.layoutTable;
  }
  return r;
}

MxAttribute.is = (attr) => { return (attr.name.startsWith(PREFIX)) };
MxAttribute.KEEP  = PREFIX + KEEP;
MxAttribute.INDEX = PREFIX + INDEX;
MxAttribute.LAYOUT_TABLE = PREFIX + LAYOUT_TABLE;

export default MxAttribute;
