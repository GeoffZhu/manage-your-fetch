# 在项目中正确使用fetch的姿势

fetch API 非常的简单

```javascript
window.fetch(url).then((res) => {
    res.json();
}).then((result) => {
    console.log(result);
})
```

但是在实际项目开发中，很少会直接这么用，因为存在兼容性问题，易用性/通用性也不够。例如 GET/POST 请求、文件上传、图片获取等，实现方式都有较大的差异。

### 为什么要做更进一步的 fetch 封
前端开发者应该都很熟悉 jQuery 中的 $.ajax/$.post/$.get 这些方法，在各种框架或库中也存在着不尽相同的 ajax API 方法实现。类似这样的 xhr api 封装屏蔽了不同平台的差异性，简化了 xhr 的使用，在一些简单的应用中似乎已经可以满足需求了，但在中大型应用中还远远不够。

这些实现满足了易用性的需求，却难以完成基于业务特性和接口约定的通用逻辑处理。我在实际的项目中，看到了太多相似而重复的类似如下的代码：
```javascript
window.fetch(url).then((res) => {
    res.json();
}).then((result) => {
    if (result.status) {
      console.log(result.data);
      ...
      ...
    } else {
      alert(result.msg || 'error')
    }
    
}).catch((err) => {
    console.log(err);
})
```
里面有大量错误处理的逻辑，还有`res.json()`这样的解析数据的中间过程。

在一个 fetch 请求的生命周期中，你可能需要做的事情有很多。如果你有考虑过如下列举的一些需求，那么，你该开始做业务层的封装了。
+更简洁的代码逻辑
+统一的数据获取方式、环境切换、数据 mock 处理
+接口约定与出错处理
+前端数据缓存(memory 与 session、local 级别)
+通用的回调处理 (成功/失败处理，xss 注入等数据预处理)
+按钮状态等处理
+公共参数获取与上报
+api 埋点性能收集(如超长耗时、网络超时、50x 出错等)


本仓库中有我封装的vue-fetch，依赖很多，而且是根据业务开发的，只是展示出一些思路，能让使用fetch如下面这样方便
```javascript
  this.$fetch({
    url: url, *必填
    params: params *必填
    ...
    ...
    ...
  }).then((result) => {
    //不需要在这处理result.status
  })
  ```
  封装中包含了错误处理和一些可以省略掉的步骤都封装在插件内部。
