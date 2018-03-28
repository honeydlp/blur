// 随机数，生成滤镜Id的工具函数
var randomID = function () {
  return '_' + Math.random().toString(36).substr(2, 9)
}

var SVG = {
  // 命名空间
  svgns: 'http://www.w3.org/2000/svg',
  xlink: 'http://www.w3.org/1999/xlink',

  // 创建svg元素
  createElement (name, attrs) {
    //创建一个具有指定的命名空间URI和限定名称的元素
    var element = document.createElementNS(SVG.svgns, name)

    if (attrs) {
      SVG.setAttr(element, attrs)
    }
    return element
  },

  // 添加属性
  setAttr (element, attrs) {
    for (var i in attrs) {
      if (i === 'href') { // path of an image should be stored as xlink:href attribute
        element.setAttributeNS(SVG.xlink, i, attrs[i])
      } else { 
        element.setAttribute(i, attrs[i])
      }
    }
    return element
  }
}

/**
 * 
 * @param {*} element 
 * @param {*} options 
 *  url: '', // 图片的url
    blurAmount: 10, //模糊度
    imageClass: '', // 该样式将应用在image和svg元素上
    overlayClass: '', // 将覆盖模糊图像的元素的CSS类
    duration: false, 
    opacity: 1 
 */
var Blur = function (element, options) {
  this.internalID = randomID()
  this.element = element
  this.width = element.offsetWidth
  this.height = element.offsetHeight
  this.parent = this.element.parentNode
  this.options = Object.assign({}, Blur.DEFAULTS, options)
  this.overlayEl = this.createOverlay()
  this.blurredImage = null
  this.generateBlurredImage(this.options.url)
}

Blur.DEFAULTS = {
  url: '', 
  blurAmount: 10, 
  imageClass: '', 
  overlayClass: '', 
  duration: false, 
  opacity: 1 
}

Blur.prototype.setBlurAmount = function (blurAmount) {
  this.options.blurAmount = blurAmount
}

Blur.prototype.generateBlurredImage = function (url) {
  const previousImage = this.blurredImage
  this.internalID = randomID()

  if (previousImage) {
    previousImage.parentNode.removeChild(previousImage)
  }

  this.blurredImage = this.createSVG(url, this.width, this.height)
}

Blur.prototype.createOverlay = function () {
  if (this.options.overlayClass && this.options.overlayClass !== '') {
    const div = document.createElement('div')
    div.classList.add(this.options.overlayClass)
    this.parent.insertBefore(div, this.element)
    return div
  }
  return false
}

Blur.prototype.createSVG = function (url, width, height) {
  var that = this
  var svg = SVG.createElement('svg', { 
    xmlns: SVG.svgns,
    version: '1.1',
    width: width,
    height: height,
    id: 'blurred' + this.internalID,
    class: this.options.imageClass,
    viewBox: '0 0 ' + width + ' ' + height,         // 起始点x,y，w,h
    preserveAspectRatio: 'none'                     //强制统一缩放比来保持图形的宽高比
  })

  var filterId = 'blur' + this.internalID 
  var filter = SVG.createElement('filter', { // filter
    id: filterId
  })

  var gaussianBlur = SVG.createElement('feGaussianBlur', { // gaussian blur element
    'in': 'SourceGraphic', 
    stdDeviation: this.options.blurAmount   // 强度的模糊
  })

  var image = SVG.createElement('image', {  // The image that uses the filter of blur
    x: 0,
    y: 0,
    width: width,
    height: height,
    'externalResourcesRequired': 'true',
    href: url,
    style: 'filter:url(#' + filterId + ')', // filter link
    preserveAspectRatio: 'none'
  })

  filter.appendChild(gaussianBlur) 
  svg.appendChild(filter) 
  svg.appendChild(image) 

  // 确保图像在持续时间100毫秒后显示，以防SVG加载事件没有触发或占用太长时间
  if (that.options.duration && that.options.duration > 0) {
    svg.style.opacity = 0
    window.setTimeout(function () {
      if (getStyle(svg, 'opacity') === '0') {
        svg.style.opacity = 1
      }
    }, this.options.duration + 100)
  }
  this.element.insertBefore(svg, this.element.firstChild)
  return svg
}

function getStyle (ele, prop) {
  return window.getComputedStyle(ele, null).getPropertyValue(prop)
}
