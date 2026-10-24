---
id: 1171
type: lab
slug: "jqueryui-simple-calender"
title: "jQueryUIを利用してミニマルデザインな実用的なカレンダーを表示する -『UI』"
date: 2017-02-28T14:55:44+09:00
modified: 2017-02-28T14:56:23+09:00
excerpt: "開始日と終了日を時空が逆転しないようにする 常に表示しておくインラインカレンダー const setCalender = ($target) => { let $calender = $(‘.calender’,"
primaryTag: "UI"
terms:
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 274, name: "jQuery", slug: "jquery" }
  - { id: 255, name: "UI", slug: "ui" }
demoUrl: https://jsfiddle.net/yutousui/ykqu87wo/
legacy:
  prev: css-background-clip-text
  next: create-js-line-motion-trigonometric-sin
---

- 開始日と終了日を時空が逆転しないようにする
- 常に表示しておくインラインカレンダー

```

const setCalender = ($target) => {

  let $calender = $('.calender', $target);
  $($calender[0]).datepicker({
    showOtherMonths: true,
    onClose: function(dateText, inst) {
      $($calender[1]).datepicker('option', 'minDate', dateText);
      $($calender[0]).val(dateText);
    }
  });

  $($calender[1]).datepicker({
    showOtherMonths: true,
    onClose: function(dateText, inst) {
      $($calender[0]).datepicker('option', 'maxDate', dateText);
      $($calender[1]).val(dateText);
    }
  });

};
setCalender($('#js-calender'));


const inlineCalender = ($target) => {

    $('#js-inline-calender').datepicker({
    onSelect: function(dateText, inst) {
      $target.val(dateText);
    }
  });

};
inlineCalender($('#js-output'));


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/ykqu87wo/embedded/result,js,html,css/dark/" allowfullscreen frameborder="0"></iframe></p>
