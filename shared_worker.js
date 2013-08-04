//接続ポートを保存するための接続の配列を初期化する
var count = 0;
var connections = new Array();

//データ格納用
var data = [];

//共有ワーカーのonconnectイベント
onconnect = function (msg) {
	//この接続の参照を取得する
	var port = msg.ports[0];

	//以後のメッセージ処理用にこの接続参照を保存する
	connections[count] = port;

	//現在の接続カウントに1を足す
	count += 1;

	//接続の応答メッセージと平均値の初期値をクライアントに送信する
	port.postMessage({msgType:'LOG',msgText:'[SW] Now connected [' + count + '].'});
	port.postMessage({msgType:'DATA',msgText:'[SW] Data updated.',dataList:data});

	//クライアントからメッセージを受信するハンドラーを作成する
	port.onmessage = function (msg) {
		//共有ワーカーに渡された値を取得する
		var newValue = msg.data;

		//値を受信したことを返信する
		port.postMessage({msgType:'LOG',msgText:'[SW] Received: ' + newValue + '.'});

		//新しい値で平均値を更新する
		updateData(newValue);
	}
}

//すべてのクライアントにメッセージを送信するヘルパー関数
function sendAllConnections(msgTypeVal,msgVal,data) {
	//クライアントをループ処理してpostMessageを呼び出す
	for (var i=0; i<count; i++){
		//クライアントにはJSON形式のメッセージをポストする
		//メッセージには、メッセージタイプ、テキスト、現在の平均値を含める
		connections[i].postMessage({msgType:msgTypeVal,msgText:msgVal,dataList:data});
	}
}

//データを更新する関数
function updateData(newValue) {
	data.push({key:newValue.key,value:newValue.value});

	//すべてのクライアントを新しい平均値で更新する
	sendAllConnections('DATA','[SW] Data updated.',data);
}