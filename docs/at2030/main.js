const AP_TYPE = "AP Type";
const NUM_TYPE = "Numerator type (indicator)";
const DEN_TYPE = "Denominator type simplified";

window.selectVals = {}

aq.loadCSV('./data.csv').then((dt) => {
  window.dt = dt;
  const cols = dt.select(AP_TYPE, NUM_TYPE, DEN_TYPE);
  const aptype = [...new Set(cols.array(AP_TYPE))].sort().slice(1);
  const numtype = [...new Set(cols.array(NUM_TYPE))].sort();
  const dentype = ["Total with AP", "Total with need", "Total with impairment", "Total participants", "Total population"];

  populateSelects(aptype,numtype,dentype)
});

function populateSelects(aptype, numtype, dentype) {
  const aptypeSelect = document.getElementById('ap-type');
  const numtypeSelect = document.getElementById('outcome-def');
  const dentypeSelect = document.getElementById('denom-def');

  const defaultValues = ["Reading glasses (id=2)", "Met", "Total with need"];
  window.selectVals[AP_TYPE] = defaultValues[0];
  window.selectVals[NUM_TYPE] = defaultValues[1];
  window.selectVals[DEN_TYPE] = defaultValues[2];

  function addOptions(arr, select) {
    arr.forEach(v => {
      const option = document.createElement('option');
      option.setAttribute('value', v);
      option.innerText = v.indexOf('(') >= 0 ? v.substring(0, v.indexOf('(')).trim() : v;
      if (defaultValues.includes(v)) {
        option.selected = true;
      }
      select.appendChild(option);
    })
  }

  addOptions(aptype, aptypeSelect);
  addOptions(numtype, numtypeSelect);
  addOptions(dentype, dentypeSelect);

  aptypeSelect.addEventListener("change", onSelect.bind(null, AP_TYPE));
  numtypeSelect.addEventListener("change", onSelect.bind(null, NUM_TYPE));
  dentypeSelect.addEventListener("change", onSelect.bind(null, DEN_TYPE));

  render();
}

function onSelect(which, e) {
  const value = e.target.value;
  window.selectVals[which] = value;

  render();
}

function render() {
  console.log('render');
  const qs = `d => d["${AP_TYPE}"] === "${window.selectVals[AP_TYPE]}" && d["${NUM_TYPE}"] === "${window.selectVals[NUM_TYPE]}" && d["${DEN_TYPE}"] === "${window.selectVals[DEN_TYPE]}"`;
  const f = window.dt.filter(qs).reify();

  if (!f.size) {
    const div = document.createElement('div');
    div.innerText = "No data found"
    document.getElementById("at2030-olli").replaceChildren(div);
  }
  else {
    const data = createData(f);
    const spec = getSpec(data);

    console.log('spec', spec);

    OlliAdapters.HighchartsAdapter(spec).then(olliVisSpec => {
      console.log('olliVisSpec', olliVisSpec)
      document.getElementById("at2030-olli").replaceChildren(olli(olliVisSpec))
    })
  }

}

function createData(filteredData) {

  const series1 = filteredData.derive({s1: (d) => {return {y: d["Numerator (value)"] / d["Denominator (value)"] * 100, label: d["Numerator (value)"]}}}).array('s1')
  const series2 = filteredData.derive({s2: (d) => {return {y: 100 - (d["Numerator (value)"] / d["Denominator (value)"] * 100), label: d["Denominator (value)"]}}}).array('s2')

  const not_label = (label) => {
    return label === "Met" ? "Unmet" : `Not ${label}`;
  }

  const data = {
    "is_ok": true,
    "data": {
        "series": [
            {
                "data": series1,
                "color": "#440154",
                "name": "Met"
            },
            {
                "data": series2,
                "color": "#fde725",
                "name": not_label(window.selectVals[NUM_TYPE])
            }
        ],
        "categories": filteredData.derive({category: (d) => d.Citation + ': ' + d.Country}).array('category')
    },
    "axis_label": window.selectVals[DEN_TYPE],
    "ap_type": window.selectVals[AP_TYPE],
    "blank_label": not_label(window.selectVals[NUM_TYPE])
  }

  return data;
}


function getSpec(need_prop_data) {

  const data = need_prop_data['data'];
  const axis_label = need_prop_data['axis_label'];

  const spec = {
    chart: {
        type: 'bar',
        description: 'This figure presents the indicator numerator (e.g. total with met need) out of a defined population denominator (e.g. total with an AP) for each study setting that reports that specific indicator type for a specific AP type. These indicators are represented proportionally on the horizontal bars for comparison and they are labelled with the absolute number of individuals for the added context of study sample size.'
    },
    title: {
        text: 'Assistive Product Access Indicators'
    },
    xAxis: {
        categories: data['categories'],
        title: {
            text: 'Study'
        },
        labels: {
            formatter: function () {
                return this.value;
            }
        }
    },
    yAxis: {
        min: 0,
        max: 100,
        title: {
            text: axis_label
        },
        reversedStacks: false
    },
    plotOptions: {
        series: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,

              formatter: function() {return this.y == 0? "" : this.point.label},
              inside: true,
            }
        },
    },
    tooltip: {
        useHTML: true,
        pointFormatter: function() {
            series = this.series,
            legendSymbol = `<span style="font-size: 0.5em; height:1em; width:1em; color:${series.color}; margin-right: 1em;"><i class="fas fa-circle"></i></span>`;
            return `<div style="display: flex; flex-direction: row; align-items: center;">${legendSymbol} <span>${series.name}: <b>${round(this.y)}% (${this.label})</b></span></div>`
        }
    },
    series: data['series'],
    accessibility: {
        valueSuffix: "%"
    }
  };
  return spec;
}