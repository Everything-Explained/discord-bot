import { readFileSync } from "fs";
import axios from 'axios';

type DefinitionText = [string, string|{ t: string; }[][]];
type DefinitionObj  = { sn: string; dt: DefinitionText };
type PseqObj        = ['sense', DefinitionObj];
type SenseObj       = ['sense'|'pseq', DefinitionObj|PseqObj[] ];

interface DefinitionData {
  def: [{ sseq: SenseObj[][] }];
}

// const ax = axios.create({
//   baseURL: 'https://dictionaryapi.com/api/v3/references/collegiate/json/',
//   timeout: 5000,
// })

// ax.get('ocean?key=68245502-811b-4615-813d-8c328d869696')
//   .then(res => {
//     test(res.data);
//   })

const file = readFileSync('./temp.json', 'utf8');
const obj = JSON.parse(file) as DefinitionData[];


const markupRegex = /\{\/?[a-z]{2}\}|\{[alink_]+\||\{[a-z]{2}|[\|\{\}]+/g;
const seg = /\s\{sx\|/g;
const colon = /\{bc\}/g;

function filterMarkup(input: string) {
  return (
    input
      .replace(colon, '')
      .replace(seg, '; ')
      .replace(markupRegex, '')
  );
}


function test(objs: DefinitionData[]) {
  const defs = objs[0].def[0].sseq;
  const examples: string[] = [];
  const definitions: string[][] = [];

  let num = 0;
  for (let def of defs) {
    const localDefs: string[] = [];
    def.forEach(v => {
      if (v[0] == 'sense') {
        const obj = v[1] as DefinitionObj;
        if (obj.dt[1] && typeof obj.dt[1][1] !== 'string') {
          obj.dt[1][1].forEach(v => (examples.push(filterMarkup(v.t))));
        }
        localDefs.push(filterMarkup(obj.dt[0][1]))
      }
      if (v[0] == 'pseq') {
        const obj = v[1] as PseqObj[];
        obj.forEach(so => localDefs.push(filterMarkup(so[1].dt[0][1])));
      }
    });
    definitions.push(localDefs);
  }
  console.log(definitions);
  // console.log(examples);
}

test(obj);
