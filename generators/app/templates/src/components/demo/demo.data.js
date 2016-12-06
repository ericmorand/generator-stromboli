var Language = function (name, code, direction, lorem) {
  return {
    name: name,
    code: code,
    direction: direction,
    lorem: lorem,
  }
};

var languages = [
  new Language('English', 'en', 'ltr', 'Lorem ipsum dolor sit amet, ferri conclusionemque eum et. Ei accusata invenire convenire nam. Ad sit lorem ubique ceteros, probo illum consulatu no duo, nam laudem quaeque ne. Ne ius amet deleniti quaestio.'),
  new Language('Arabic', 'ar', 'rtl', 'من المسرح والنرويج دون, احداث وتتحمّل والفرنسي كل بلا, حتى ٣٠ بقعة ا الفرنسية. مما ديسمبر العمليات الشّعبين ٣٠, لان في التنازلي استطاعوا. حادثة المتحدة عن وفي. أمام وحرمان دون تم. الغالي الثقيلة ذات ثم, فكانت الدولارات حين أي.'),
  new Language('Hebrew', 'he', 'rtl', 'את מדע כלשהו למאמרים. וקשקש אנגלית אם רבה. זאת התוכן למחיקה גם, של מתן העזרה ייִדיש. הבקשה טבלאות בלשנות ויש את, מה יוני למחיקה משופרות שער, גם היא שפות ברוכים ביוטכנולוגיה. לראות גרמנית קלאסיים קרן את.')
];

module.exports = {
  languages: languages
};
