hexo.extend.filter.register('after_render:html', function (str) {
  return str
    .replace(/<(img|br|hr|meta)([^>]*[^/])>/g, '<$1$2/>')
});