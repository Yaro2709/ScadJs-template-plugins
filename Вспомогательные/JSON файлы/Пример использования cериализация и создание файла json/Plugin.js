function bindObj(thisObj, func) {
    return function () {
        return func.apply(thisObj, arguments);
    };
}

var global_obj = {
    explorer: null,
    excel: null
};

function Plugin_Clean() {
    if (global_obj.explorer) {
        global_obj.explorer.Quit();
        global_obj.explorer = null;
    }

    if (global_obj.excel) {
        global_obj.excel.DisplayAlerts = false;
        global_obj.excel.Quit();
        global_obj.excel = null;
    }
}

function Plugin_Cancel(engine) {
    Plugin_Clean();

    if (engine) {
        engine.Cancel();
    }
}

// function Plugin_ActivateUI(engine)
// {

// }

function Plugin_Execute(engine) {
    try {
        var model = engine.GetModel();
        var editor = engine.GetEditor();

        var pluginPath = engine.GetPluginRootDirectory();//���� � ����� �������

        //�������� ����� 
        var node_1 = CreateNode(editor, 0,0,0);
        var node_2 = CreateNode(editor, 2,3,4);
        var nodeArr = [node_1, node_2]; //��������� ���� � ������;

        //������� json ����
        var jsonWork = new JSONConverter();//������ ��� ������ � �������
		//���������� ������ � ������ � ���� .json
        jsonWork.WriteToFile(pluginPath + "nodeArr.json", nodeArr);

    } catch (e) {
        engine.Cancel(e);
    }
}
//===============================================================================
//#region SCAD Functions

/**
 * ������ ��� ������ � Json
 *
 */
function JSONConverter() {
    /**
     * ��������� ���� .json � ������������ � ������
     * @param {string} path ������ ��� �����
     */
    this.Convert = function (path) {
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var jsonFile = fso.OpenTextFile(path, 1);
        var jsonObj = jsonFile.ReadAll();
        jsonFile.Close();
        var newObj = JSON.parse(jsonObj);
        return newObj;
    };

    /**
     * ��������� ������ � .json
     * @param {object} obj ������
     */
    this.toJson = function (obj) {
        var json = JSON.stringify(obj);
        return json;
    };

    /**
     * ���������� ������ � ����
     * @param {string} filePath ������ ��� ������������ ����� � ����������� .json
     * @param {object} obj ������ ��� �������� � Json
     */
    this.WriteToFile = function (filePath, obj) {
        var json = JSON.stringify(obj);
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var f = fso.CreateTextFile(filePath, true);
        f.WriteLine(json);
        f.Close();
    };
}

/**
 * �������� �����:
 			-� ������ ���������� �� �����
			-c ���������� ��������
 * @param {*} editor - SCAD ��������
 * @param {object} startNode - ������ ������� ����
 * @param {object} endNode - ������ ������� ���������� ����
 * @param {number} step - ���-�� ���������
 * @param {number} joint - ��������� �������� �� ����� ������: 0 ��� null - ������� ����������;
 * 															  1 - ������� �� Ux � Uy �� 2 ������
 * 															  2 - ������� �� Ux � Uy � ������
 * 														      3 - ������� �� Ux � Uy � �����
 */
function BeamSCAD(editor, startNode, endNode, step, joint) {
    this.elementInfo = {
        id: "b_5",
        connect: 11,
        role: "any",
        incline: true,
        column: false
    };

    var elemNumberArr = []; //������ ������� ���������
    var nodeNumberArr = []; //������ �������� �����
    var centerNodeObjArr = []; //������ ����������� �������� �����
    _joint = joint;
    //#region ��������
    if (step <= 0) {
        step = 1;
    }

    if (_joint > 3 || _joint < 0) {
        _joint = 1;
    }

    //#endregion
    this.Create = function () {
        //#region ��������
        var eQ = step; //���-�� ���������
        var baseElemNum = editor.ElemAdd(eQ); // ���� ������ �������� � ���������, ����� ������� ��������
        var eI = baseElemNum; // ����� ������� ��������

        var curElem = { TypeElem: 5, ListNode: [0, 0] }; //�������� ������� - ��� �������� 5, ������ �����[start, end]
        var Joint = { Mask: 48, Place: 1 }; //������ ��� ������� ��������
        //#endregion

        //#region ����
        //���� ���������� ������� ������� �� ����������� ����� ����
        if (step > 1) {
            var nQ = step - 1; //���������� �����
            var midleNodeNum = editor.NodeAdd(nQ); //����� ������� ����

            //����������� ����� �������� �� ���� ����������� ����� ������
            var objLenCoor = LenghtRegion(startNode, endNode, step);

            var curNode = {
                x: startNode.x + objLenCoor.lenX,
                y: startNode.y + objLenCoor.lenY,
                z: startNode.z + objLenCoor.lenZ
            };
            //#region ��������
            curElem.ListNode[0] = startNode.nodeNum; //���������� 1 ���� ��� ��������, ��������� ����
            nodeNumberArr.push(startNode);

            for (var i = 0; i < nQ; i++) {
                editor.NodeUpdate(midleNodeNum + i, curNode); //�������� ������ ����
                curElem.ListNode[1] = midleNodeNum + i; //���������� 2 ���� ��� ��������
                editor.ElemUpdate(eI + i, curElem); //�������� ��������

                //���������� �������� ����������
                elemNumberArr.push(eI + i);

                //������ ��� ������ �����
                var nodeObj = {
                    nodeNum: midleNodeNum + i,
                    x: curNode.x,
                    y: curNode.y,
                    z: curNode.z
                };

                nodeNumberArr.push(nodeObj); //������ ���� � ������
                centerNodeObjArr.push(nodeObj); //������ ���� � ������

                curNode.x += objLenCoor.lenX;
                curNode.y += objLenCoor.lenY;
                curNode.z += objLenCoor.lenZ;

                curElem.ListNode[0] = midleNodeNum + i;
            }
            curElem.ListNode[1] = endNode.nodeNum;
            editor.ElemUpdate(eI + nQ, curElem);

            elemNumberArr.push(eI + nQ);
            nodeNumberArr.push(endNode);
            //#endregion

            //#region ���������� ��������
            //�� 2 ������
            if (_joint == 1) {
                editor.JointSet(eI, 1, Joint); //������ �������
                editor.JointSet(eI + nQ, 2, Joint); //��������� �������
            }
            //������ � ������
            if (_joint == 2) {
                editor.JointSet(eI, 1, Joint); //������ �������
            }
            //������ � �����
            if (_joint == 3) {
                editor.JointSet(eI + nQ, 2, Joint); //��������� �������
            }
            //#endregion
        } else {
            curElem.ListNode[0] = startNode.nodeNum;
            curElem.ListNode[1] = endNode.nodeNum;
            editor.ElemUpdate(eI, curElem); //�������� ��������

            elemNumberArr.push(eI);
            nodeNumberArr.push(startNode);
            nodeNumberArr.push(endNode);

            //#region ���������� �������� �� 2 ������
            if (_joint == 1) {
                editor.JointSet(eI, 1, Joint);
                editor.JointSet(eI, 2, Joint);
            } else if (_joint == 2) {
                editor.JointSet(eI, 1, Joint); //������ �������
            } else if (_joint == 3) {
                editor.JointSet(eI, 2, Joint); //��������� �������
            }

            //#endregion
        }
        //#endregion
    };

    /**
     * @returns {number} ���������� ����� ���������� ��������
     */
    this.GetLastElemNumber = function () {
        return elemNumberArr[elemNumberArr.length - 1];
    };

    /**
     * @returns {Array} ���������� ������ ���� ����� � ���� ��������
     */
    this.GetAllNodes = function () {
        return nodeNumberArr;
    };
    /**
     * @returns {[]} ���������� ������ ����� ��� ������������� ������
     */
    this.GetRightConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(nodeNumberArr[nodeNumberArr.length - 1]);
        return connectionNodesArr;
    };
    /**
     * @returns {[]} ���������� ������ ����� ��� ������������� �����
     */
    this.GetLeftConnectionNodes = function () {
        var connectionNodesArr = [];
        connectionNodesArr.push(nodeNumberArr[0]);
        return connectionNodesArr;
    };
    /**
     * @returns {Array} ���������� ������ ���� ������� ���������
     */
    this.GetAllNumbersElemets = function () {
        return elemNumberArr;
    };

    /**
     * @returns ���������� ����������� ���� �������. ���� ��� �� ������� ���������� null
     */
    this.GetCenterNodes = function () {
        if (centerNodeObjArr == null) {
            return null;
        }
        return centerNodeObjArr;
    };

    /**
                 * 
                 * @returns {object} ������ � ��������� ���� �� ���� ����������� {
                         lenX,- �������� �� ��� �
                        lenY, - �������� �� ��� Y
                        lenZ, - �������� �� ��� Z
                        lenghtReg, - ����� ��������� �������
                        lengthElement - ����� ����� ��������}
                */
    this.GetLengthRegion = function () {
        return objLenCoor;
    };

    /**
     * ������ �������� ������ ���� �������
     * @param {number} numbJoint - ����� ����������: 0 ��� null - ������� ����������;
     * 															  1 - ������� �� Ux � Uy �� 2 ������;
     * 															  2 - ������� �� Ux � Uy � ������;
     * 														      3 - ������� �� Ux � Uy � �����;
     */
    this.SetJoinNumber = function (numbJoint) {
        if (numbJoint == 1) {
            editor.JointSet(eI, 1, Joint);
            editor.JointSet(eI, 2, Joint);
        } else if (numbJoint == 2) {
            editor.JointSet(eI, 1, Joint); //������ �������
        } else if (numbJoint == 3) {
            editor.JointSet(eI, 2, Joint); //��������� �������
        }
    };

    /**
     * ���������� ���������� ���� ������� �����
     */
    this.GetAngleBeam = function () {
        var numbAngelA = 0;
        var hight = startNode.z - endNode.z;
        if (hight != 0) {
            var math = new MathGeometry();
            var lengTopElem = math.LenghtRegion(startNode, endNode);

            var a = lengTopElem; //����� �������� ����� ���������
            var b = endNode.x - startNode.x;
            var c = hight;

            var cosA = (a * a + b * b - c * c) / (2 * a * b);
            var radA = Math.acos(cosA);
            numbAngelA = radA * (180 / Math.PI);
        }

        return numbAngelA;
    };
    /**
     * @returns {number} ���������� ������ ����� � �����
     */
    this.GetTrussHeightInPillar = function () {
        var height = 0;

        if (this.elementInfo.column) {
            height = hightStart;
        }
        return height;
    };

    /**
     * ��������� ����� �������, �����, ����� �������� ��������� � ����������� �� ���������.
     * @param {object} endPoint - ������ ������� ����
     * @param {object} startPoint - ������ ���������� ����
     * @param {number} step - ���-�� ���������
     * @returns {object} ������ � ��������� ���� �� ���� �����������
     */
    function LenghtRegion(startPoint, endPoint, step) {
        var x = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
        var y = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
        var z = (endPoint.z - startPoint.z) * (endPoint.z - startPoint.z);

        var lenEl = parseFloat(Math.sqrt(x + y + z)); //����� ����� ��������
        var lenReg = parseFloat(lenEl / step);
        var fi = lenReg / (lenEl - lenReg);

        var coordObj = {
            x: (startPoint.x + fi * endPoint.x) / (1 + fi),
            y: (startPoint.y + fi * endPoint.y) / (1 + fi),
            z: (startPoint.z + fi * endPoint.z) / (1 + fi)
        };
        var lenObj = {
            lenX: coordObj.x - startPoint.x,
            lenY: coordObj.y - startPoint.y,
            lenZ: coordObj.z - startPoint.z,
            lenghtReg: lenReg,
            lengthElement: lenEl
        };
        return lenObj;
    }

    function MathGeometry() {
        /**
         * ��������� ����
         * @param {object} point1 ������� 1 (����)
         * @param {object} point2 ������� 2 (����)
         * @param {object} calcPoint �������, ����� �� ��������� ����������� ���� (����)
         * @returns {number} ���� � ��������
         */
        this.AngelTriangle = function (point1, point2, calcPoint) {
            var a = this.LenghtRegion(point1, calcPoint);
            var b = this.LenghtRegion(point2, calcPoint);
            var c = this.LenghtRegion(point2, point1);

            var cosA = (a * a + b * b - c * c) / (2 * a * b);
            var radA = Math.acos(cosA);
            var numbAngelA = radA * (180 / Math.PI);

            return numbAngelA;
        };

        /**
         * ��������� ����� �������, �����, ����� �������� ��������� � ����������� �� ���������.
         * @param {object} endPoint - ������ ������� ����
         * @param {object} startPoint - ������ ���������� ����
         * @returns {number} ����� ����� �������
         */
        this.LenghtRegion = function (startPoint, endPoint) {
            var x = (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x);
            var y = (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y);
            var z = (endPoint.z - startPoint.z) * (endPoint.z - startPoint.z);

            var lenEl = parseFloat(Math.sqrt(x + y + z)); //����� ����� ��������

            return lenEl;
        };
    }
}

/**
 * ������� ���� � ��������� �����������
 * @param {*} editor �������� SCAD
 * @param {number} x ���������� �
 * @param {number} y ���������� �
 * @param {number} z ���������� Z
 * @returns  ������ ���� - 
        {nodeNum:baseNodeNum,
        x:curNode.x,
        y:curNode.y,
        z:curNode.z}
    */
function CreateNode(editor, x, y, z) {
    var nQ = 1;
    var baseNodeNum = editor.NodeAdd(nQ); //����� ������� ����
    var curNode = { x: x, y: y, z: z };
    editor.NodeUpdate(baseNodeNum, curNode); //�������� ���� � �����
    //������ ����
    var nodeObj = {
        nodeNum: baseNodeNum,
        x: curNode.x,
        y: curNode.y,
        z: curNode.z
    };

    return nodeObj;
}
//#endregion
//===============================================================================
//#region �������� ��� JSON
if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three =
        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable =
        /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous =
        /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? "0" + n : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function () {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear() +
                      "-" +
                      f(this.getUTCMonth() + 1) +
                      "-" +
                      f(this.getUTCDate()) +
                      "T" +
                      f(this.getUTCHours()) +
                      ":" +
                      f(this.getUTCMinutes()) +
                      ":" +
                      f(this.getUTCSeconds()) +
                      "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;

    function quote(string) {
        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? '"' +
                  string.replace(rx_escapable, function (a) {
                      var c = meta[a];
                      return typeof c === "string"
                          ? c
                          : "\\u" +
                                ("0000" + a.charCodeAt(0).toString(16)).slice(
                                    -4
                                );
                  }) +
                  '"'
            : '"' + string + '"';
    }

    function str(key, holder) {
        // Produce a string from holder[key].

        var i; // The loop counter.
        var k; // The member key.
        var v; // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (
            value &&
            typeof value === "object" &&
            typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case "string":
                return quote(value);

            case "number":
                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : "null";

            case "boolean":
            case "null":
                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce "null". The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is "object", we might be dealing with an object or an array or
            // null.

            case "object":
                // Due to a specification blunder in ECMAScript, typeof null is "object",
                // so watch out for that case.

                if (!value) {
                    return "null";
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (
                    Object.prototype.toString.apply(value) === "[object Array]"
                ) {
                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v =
                        partial.length === 0
                            ? "[]"
                            : gap
                            ? "[\n" +
                              gap +
                              partial.join(",\n" + gap) +
                              "\n" +
                              mind +
                              "]"
                            : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v);
                            }
                        }
                    }
                } else {
                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v =
                    partial.length === 0
                        ? "{}"
                        : gap
                        ? "{\n" +
                          gap +
                          partial.join(",\n" + gap) +
                          "\n" +
                          mind +
                          "}"
                        : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {
            // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {
            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

                // If the space parameter is a string, it will be used as the indent string.
            } else if (typeof space === "string") {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (
                replacer &&
                typeof replacer !== "function" &&
                (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")
            ) {
                throw new Error("JSON.stringify");
            }

            // Make a fake root object containing our value under the key of "".
            // Return the result of stringifying the value.

            return str("", { "": value });
        };
    }

    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {
                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u" +
                        ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with "()" and "new"
            // because they can cause invocation, and "=" because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
            // replace all simple value tokens with "]" characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or "]" or
            // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {
                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === "function" ? walk({ "": j }, "") : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
})();
//#endregion
