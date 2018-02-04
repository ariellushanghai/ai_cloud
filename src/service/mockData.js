import _ from 'lodash'

const jobRelies = (id) => {
  console.log(`jobRelies(${id})`)
  let result = {
    "POST": [],
    "PRE": []
  };

  _.times(10, (idx) => {
    result.POST.push({
      "id": _.random(idx, 10e5),
      "name": 'NAME_POST_' + _.shuffle('起自_城市西北部_的宝山顾村公园站').join(''),
      "status": ["ERROR", 'PENDING', 'DONE', "RUNNING"][idx % 4]
    })
  });
  _.times(10, (idx) => {
    result.PRE.push({
      "id": _.random(idx, 10e5),
      "name": 'NAME_PRE_' + _.shuffle('起自_城市西北部_的宝山顾村公园站').join(''),
      "status": ["ERROR", 'PENDING', 'DONE', "RUNNING"][idx % 4]
    })
  });
  console.log(result);
  let p = new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve(result);
    }, 300);
  });

  return p;
// => an integer between 0 and 5
}

export {jobRelies as default}

