---
id: 962
type: lab
slug: "toc"
title: "記事の見出し(h2とh3)をもとに、開閉できる目次を生成してスクロールでその項目へ移動するUI -『javascript』"
date: 2017-01-25T21:10:54+09:00
modified: 2017-01-25T21:15:30+09:00
excerpt: "ブログなど長めの記事で多用するUI。 javascript var generateToc = function generateToc(target) { if (target.length) { (function"
primaryTag: "javascript"
terms:
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 255, name: "UI", slug: "ui" }
demoUrl: https://jsfiddle.net/yutousui/n7gr16v6/
legacy:
  prev: styling-input
  next: hover-effect-to-change-the-background-colo
---

ブログなど長めの記事で多用するUI。

#### javascript

```

var generateToc = function generateToc(target) {

  if (target.length) {
    (function () {

      var toc = $('<section class="toc"></section>'),
            title = $('<h2 class="toc_title">toc<br>ー</h2>'),
            ul = $('<ul class="toc_list"></ul>'),
            html = toc.prepend(title),
            h2 = target.find('h2'),
            anchorName = 'section',
            text = void 0,
            childText = void 0;

      // - -
      // create list item
      // - - - - - - - - -
      var createItem = function createItem() {

        h2.each(function (index, val) {

          var child = $('<ul class="toc_child"></ul>'),
                anchorId = anchorName + index;

          $(val).attr('id', anchorId).nextUntil('h2').filter('h3').each(function (ci, cv) {

            var anchorChildId = anchorId + '-' + ci;

            childText = $(cv).attr('id', anchorChildId).html();
            $('<li class="toc_item-child"></li>').text(childText).appendTo(child).wrapInner(function () {
              return '<a class="toc_target" href="#' + anchorChildId + '"></a>';
            });
          });

          text = $(val).html();
          $('<li class="toc_item"></li>').wrapInner(function () {
            return '<a class="toc_target" href="#' + anchorId + '">' + text + '</a>';
          }).appendTo(ul).append(child);
        });
      };
      createItem();

      // - -
      // insert toc
      // - - - - - - - - -
      var insertToc = function insertToc() {

        if (ul.find('li').length > 1) {

          html.append(ul);
          target.before(html);

        }
      };
      insertToc();

      // - -
      // toggle button
      // - - - - - - - - - -
      var clickBtn = function clickBtn() {

        title.on('click', function () {

          toc.toggleClass('is-active');
          ul.slideToggle(250);
        });
      };
      clickBtn();

      // - -
      // page scroll
      // - - - - - - - - - -
      var scroll = function scroll() {

        toc.find('a').on('click', function (e) {

          var anchor = $(this.hash),
                time = 550,
                topDistance = 15,
                anchorOffset = anchor.offset().top - topDistance;

          $('html,body').animate({
            scrollTop: anchorOffset
          }, {
            duration: time
          }, 'easeOutCubic');
        });
      };
      scroll();
    })();
  }
};
generateToc($('#js-toc'));


```

<p><iframe width="100%" height="450" src="//jsfiddle.net/yutousui/n7gr16v6/embedded/result,js,html,css/dark/" allowfullscreen frameborder="0"></iframe></p>
