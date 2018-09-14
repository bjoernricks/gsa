/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/object/keys';

import {isDate, isDuration} from 'gmp/models/date';

import {
  parseCsv,
  parseEnvelopeMeta,
  parseFloat,
  parseInt,
  parseProgressElement,
  parseQod,
  parseTextElement,
  parseSeverity,
  parseYesNo,
  YES_VALUE,
  NO_VALUE,
  parseDate,
  parseDuration,
  setProperties,
  parseProperties,
} from '../parser';

describe('parseInt tests', () => {

  test('should parse int number string', () => {
    expect(parseInt('5')).toBe(5);
  });

  test('should parse float number strings', () => {
    expect(parseInt('5.0')).toBe(5);
  });

  test('should shut cut float strings', () => {
    expect(parseInt('5.9999')).toBe(5);
    expect(parseInt('5.1')).toBe(5);
  });

  test('should cut float numbers', () => {
    expect(parseInt(5.9999)).toBe(5);
    expect(parseInt(5.1)).toBe(5);
  });

  test('should parse empty string as undefined', () => {
    expect(parseInt('')).toBeUndefined();
    expect(parseInt(' ')).toBeUndefined();
  });

  test('should parse string without a number as undefined', () => {
    expect(parseInt('abc')).toBeUndefined();
    expect(parseInt('5a')).toBeUndefined();
  });

  test('should parse infintiy as undefined', () => {
    expect(parseInt(Infinity)).toBeUndefined();
    expect(parseInt('Infinity')).toBeUndefined();
  });

});

describe('parseSeverity tests', () => {

  test('should parse int number strings', () => {
    expect(parseSeverity('0')).toEqual(0);
    expect(parseSeverity('1')).toEqual(1);
    expect(parseSeverity('5')).toEqual(5);
  });

  test('should parse float number strings', () => {
    expect(parseSeverity('0.0')).toEqual(0);
    expect(parseSeverity('1.1')).toEqual(1.1);
    expect(parseSeverity('5.4')).toEqual(5.4);
  });

  test('should pass through numbers', () => {
    expect(parseSeverity(0)).toEqual(0);
    expect(parseSeverity(1)).toEqual(1);
    expect(parseSeverity(5)).toEqual(5);
    expect(parseSeverity(1.1)).toEqual(1.1);
    expect(parseSeverity(5.4)).toEqual(5.4);
  });

  test('should parse strings as undefined', () => {
    expect(parseSeverity('abc')).toBeUndefined();
    expect(parseSeverity('5a')).toBeUndefined();
  });

  test('should parse empty string as undefined', () => {
    expect(parseSeverity('')).toBeUndefined();
    expect(parseSeverity(' ')).toBeUndefined();
  });

});

describe('parseFloat tests', () => {

  test('should parse int number strings', () => {
    expect(parseFloat('0')).toEqual(0);
    expect(parseFloat('1')).toEqual(1);
    expect(parseFloat('5')).toEqual(5);
  });

  test('should parse float number strings', () => {
    expect(parseFloat('0.0')).toEqual(0);
    expect(parseFloat('1.1')).toEqual(1.1);
    expect(parseFloat('5.4')).toEqual(5.4);
  });

  test('should pass through numbers', () => {
    expect(parseFloat(0)).toEqual(0);
    expect(parseFloat(1)).toEqual(1);
    expect(parseFloat(5)).toEqual(5);
    expect(parseFloat(1.1)).toEqual(1.1);
    expect(parseFloat(5.4)).toEqual(5.4);
  });

  test('should parse strings as undefined', () => {
    expect(parseFloat('abc')).toBeUndefined();
    expect(parseFloat('5a')).toBeUndefined();
  });

  test('should parse empty string as undefined', () => {
    expect(parseFloat('')).toBeUndefined();
    expect(parseFloat(' ')).toBeUndefined();
  });

});

describe('parseTextElement tests', () => {

  test('should convert text elements', () => {
    expect(parseTextElement({
      __text: 'foo',
      __excerpt: '1',
    })).toEqual({
      text: 'foo',
      text_excerpt: '1',
    });
  });

  test('should convert plain text elements', () => {
    expect(parseTextElement('foo')).toEqual({
      text: 'foo',
      text_excerpt: '0',
    });
  });

});

describe('parseProgressElement tests', () => {

  test('should parse progress as float', () => {
    expect(parseProgressElement('0')).toEqual(0);
    expect(parseProgressElement('1')).toEqual(1);
    expect(parseProgressElement('5')).toEqual(5);
    expect(parseProgressElement('0.0')).toEqual(0);
    expect(parseProgressElement('1.1')).toEqual(1.1);
    expect(parseProgressElement('5.4')).toEqual(5.4);
    expect(parseProgressElement(0)).toEqual(0);
    expect(parseProgressElement(1)).toEqual(1);
    expect(parseProgressElement(5)).toEqual(5);
    expect(parseProgressElement(1.1)).toEqual(1.1);
    expect(parseProgressElement(5.4)).toEqual(5.4);
  });

  test('should parse invalid progress values as zero', () => {
    expect(parseProgressElement()).toEqual(0);
    expect(parseProgressElement('')).toEqual(0);
    expect(parseProgressElement(' ')).toEqual(0);
    expect(parseProgressElement('foo')).toEqual(0);
    expect(parseProgressElement('1a')).toEqual(0);
  });

  test('should parse __text as progress', () => {
    expect(parseProgressElement({__text: '0'})).toEqual(0);
    expect(parseProgressElement({__text: '1'})).toEqual(1);
    expect(parseProgressElement({__text: '5'})).toEqual(5);
    expect(parseProgressElement({__text: '0.0'})).toEqual(0);
    expect(parseProgressElement({__text: '1.1'})).toEqual(1.1);
    expect(parseProgressElement({__text: '5.4'})).toEqual(5.4);
    expect(parseProgressElement({__text: 0})).toEqual(0);
    expect(parseProgressElement({__text: 1})).toEqual(1);
    expect(parseProgressElement({__text: 5})).toEqual(5);
    expect(parseProgressElement({__text: 1.1})).toEqual(1.1);
    expect(parseProgressElement({__text: 5.4})).toEqual(5.4);
  });

});

describe('parseYesNo tests', () => {

  test('should parse yes values', () => {
    expect(parseYesNo('1')).toEqual(YES_VALUE);
    expect(parseYesNo(1)).toEqual(YES_VALUE);
    expect(parseYesNo(YES_VALUE)).toEqual(YES_VALUE);
  });

  test('should parse other values as no value', () => {
    expect(parseYesNo()).toEqual(NO_VALUE);
    expect(parseYesNo('')).toEqual(NO_VALUE);
    expect(parseYesNo('foo')).toEqual(NO_VALUE);
    expect(parseYesNo('0')).toEqual(NO_VALUE);
    expect(parseYesNo(0)).toEqual(NO_VALUE);
    expect(parseYesNo(NO_VALUE)).toEqual(NO_VALUE);
  });

});

describe('parseCsv tests', () => {

  test('should parse undefined and empty', () => {
    expect(parseCsv()).toEqual([]);
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv(' ')).toEqual([]);
  });

  test('should parse csv values', () => {
    expect(parseCsv('foo,bar')).toEqual(['foo', 'bar']);
    expect(parseCsv(' foo , bar ')).toEqual(['foo', 'bar']);
    expect(parseCsv(' foo    ,      bar ')).toEqual(['foo', 'bar']);
    expect(parseCsv('foo, bar, ')).toEqual(['foo', 'bar', '']);
    expect(parseCsv('foo, bar,,,,')).toEqual(['foo', 'bar', '', '', '', '']);
  });

});

describe('parseQod tests', () => {

  test('should convert value to float', () => {
    expect(parseQod({
      value: '55',
      type: 'remote_vul',
    })).toEqual({
      value: 55,
      type: 'remote_vul',
    });
  });

  test('should drop unknown properties', () => {
    expect(parseQod({
      value: '55',
      type: 'remote_vul',
      foo: 'bar',
    })).toEqual({
      value: 55,
      type: 'remote_vul',
    });
  });

});

describe('parseEnvelopeMeta tests', () => {

  test('should parse envelope information', () => {
    expect(parseEnvelopeMeta({
      version: '1.0',
      backend_operation: '0.01',
      vendor_version: '1.1',
      i18n: 'en',
      time: 'Fri Sep 14 11:26:40 2018 CEST',
      timezone: 'Europe/Berlin',
    })).toEqual({
      version: '1.0',
      backendOperation: '0.01',
      vendorVersion: '1.1',
      i18n: 'en',
      time: 'Fri Sep 14 11:26:40 2018 CEST',
      timezone: 'Europe/Berlin',
    });
  });

  test('should drop unkown envelope information', () => {
    expect(parseEnvelopeMeta({
      version: '1.0',
      backend_operation: '0.01',
      vendor_version: '1.1',
      i18n: 'en',
      time: 'Fri Sep 14 11:26:40 2018 CEST',
      timezone: 'Europe/Berlin',
      foo: 'bar',
      lorem: 'ipsum',
    })).toEqual({
      version: '1.0',
      backendOperation: '0.01',
      vendorVersion: '1.1',
      i18n: 'en',
      time: 'Fri Sep 14 11:26:40 2018 CEST',
      timezone: 'Europe/Berlin',
    });
  });
});

describe('setProperties tests', () => {

  test('should create new object', () => {
    expect(setProperties()).toEqual({});
  });

  test('should not change object', () => {
    const obj = {foo: 'bar'};
    expect(setProperties(undefined, obj)).toBe(obj);
  });

  test('should set properties on new object', () => {
    const obj = setProperties({
      foo: 'bar',
      lorem: 'ipsum',
    });

    expect(obj.foo).toEqual('bar');
    expect(obj.lorem).toEqual('ipsum');

    expect(Object.keys(obj)).toEqual(expect.arrayContaining(['foo', 'lorem']));

    expect(() => {
      obj.foo = 'a';
    }).toThrow();
    expect(() => {
      obj.lorem = 'a';
    }).toThrow();
  });

  test('should skip properties starting with underscore', () => {
    const obj = setProperties({
      foo: 'bar',
      _lorem: 'ipsum',
    });

    expect(obj.foo).toEqual('bar');
    expect(obj.lorem).toBeUndefined();
    expect(obj._lorem).toBeUndefined();
  });

  test('should set properties on existing object', () => {
    const orig = {foo: 'bar'};
    const obj = setProperties({
      bar: 'foo',
      lorem: 'ipsum',
    }, orig);

    expect(obj).toBe(orig);
    expect(obj.foo).toEqual('bar');
    expect(obj.bar).toEqual('foo');
    expect(obj.lorem).toEqual('ipsum');

    expect(Object.keys(obj)).toEqual(
      expect.arrayContaining(['bar', 'foo', 'lorem']));

    expect(() => {
      obj.bar = 'a';
    }).toThrow();
    expect(() => {
      obj.lorem = 'a';
    }).toThrow();

    obj.foo = 1;
    expect(obj.foo).toEqual(1);
  });

});

describe('parseProperties tests', () => {

  test('should create new object', () => {
    expect(parseProperties()).toEqual({});
  });

  test('should create a shallow copy', () => {
    const foo = {
      a: 1,
    };

    const obj = {
      foo,
      lorem: 'ipsum',
    };

    const parsed = parseProperties(obj);

    expect(parsed).not.toBe(obj);
    expect(parsed.foo).toBe(obj.foo);
    expect(parsed.lorem).toEqual('ipsum');
  });

  test('should copy additional properties', () => {
    const obj = {
      foo: 'bar',
      lorem: 'ipsum',
    };

    const parsed = parseProperties(obj, {bar: 'foo'});

    expect(parsed.bar).toEqual('foo');
    expect(parsed.foo).toEqual('bar');
    expect(parsed.lorem).toEqual('ipsum');
  });

  test('should not override properties with additional properties', () => {
    const obj = {
      foo: 'bar',
      lorem: 'ipsum',
    };

    const parsed = parseProperties(obj, {foo: 'foo'});

    expect(parsed.foo).toEqual('bar');
    expect(parsed.lorem).toEqual('ipsum');
  });

  test('should parse id', () => {
    const parsed = parseProperties({_id: 'a1'});
    expect(parsed.id).toEqual('a1');
  });

  test('should parse creation_time', () => {
    const parsed = parseProperties({creation_time: '2018-01-01'});

    expect(parsed.creation_time).toBeUndefined();
    expect(parsed.creationTime).toBeDefined();
    expect(isDate(parsed.creationTime)).toEqual(true);
  });

  test('should parse modification_time', () => {
    const parsed = parseProperties({modification_time: '2018-01-01'});

    expect(parsed.modification_time).toBeUndefined();
    expect(parsed.modificationTime).toBeDefined();
    expect(isDate(parsed.modificationTime)).toEqual(true);
  });

  test('should prefix type', () => {
    const parsed = parseProperties({type: 'foo'});

    expect(parsed.type).toBeUndefined();
    expect(parsed._type).toEqual('foo');
  });

});

describe('parseDate tests', () => {

  test('should return undefined', () => {
    expect(parseDate()).toBeUndefined();
  });

  test('should return a date', () => {
    const date = parseDate('2018-01-01');

    expect(date).toBeDefined();
    expect(isDate(date)).toEqual(true);
  });

});

describe('parseDuration tests', () => {

  test('should return undefined', () => {
    expect(parseDuration()).toBeUndefined();
  });

  test('should parse duration', () => {
    expect(isDuration(parseDuration('666'))).toEqual(true);
    expect(isDuration(parseDuration(666))).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
