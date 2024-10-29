
const OPENAPI_KEY = "";

// Vision API Key
VISION_API_KEY = "";
let imagestring = ""; // 이미지 데이터를 저장할 변수

// 이미지 파일을 처리하는 함수
function processFile(event) {
    content = event.target.result;
    imagestring = content.replace('data:image/jpeg;base64,', '');
    document.getElementById("gimage").src = content;
    document.getElementById("gimage").style.display = "block"; // 이미지가 있으면 표시
}

// 이미지 업로드 함수
function uploadFiles(files) {
    file = files[0];
    reader = new FileReader();
    reader.onloadend = processFile;
    reader.readAsDataURL(file);
}

// 이미지 분석 함수
function analyze() {
    const data = {
        requests: [{
            image: { content: imagestring },
            features: [{ type: "FACE_DETECTION", maxResults: 100 }]
        }]
    };

    $.ajax({
        type: "POST",
        url: 'https://vision.googleapis.com/v1/images:annotate?key=' + VISION_API_KEY,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8"
    }).done(function (response) {
        console.log(response);
        displayResponse(response);
    }).fail(function (error) {
        console.log(error);
        document.getElementById("resultArea").innerHTML = "Error: " + JSON.stringify(error);
    });
}

// 이미지 분석 결과 표시 함수
function displayResponse(response) {
    let resultArea = document.getElementById("resultArea");
    let faceAnnotations = response.responses[0].faceAnnotations;

    if (faceAnnotations && faceAnnotations.length > 0) {
        let resultText = "<strong>얼굴이 감지되었습니다: " + faceAnnotations.length + "명</strong><br><br>";

        faceAnnotations.forEach((face, index) => {
            resultText += "<strong>얼굴 " + (index + 1) + ":</strong><br>";
            resultText += "기쁨도: " + getLikelihoodPercentage(face.joyLikelihood) + "%<br>";
            resultText += "슬픔도: " + getLikelihoodPercentage(face.sorrowLikelihood) + "%<br>";
            resultText += "화남도: " + getLikelihoodPercentage(face.angerLikelihood) + "%<br>";
            resultText += "놀람도: " + getLikelihoodPercentage(face.surpriseLikelihood) + "%<br>";
            resultText += "얼굴 각도 (Roll): " + face.rollAngle.toFixed(2) + "도<br><br>";
        });

        resultArea.innerHTML = resultText;
    } else {
        resultArea.innerHTML = "<strong>얼굴이 감지되지 않았습니다.</strong>";
    }
}

// 감지된 감정의 강도를 백분율로 변환하는 함수
function getLikelihoodPercentage(likelihood) {
    switch (likelihood) {
        case "VERY_LIKELY": return 90;
        case "LIKELY": return 75;
        case "POSSIBLE": return 50;
        case "UNLIKELY": return 25;
        case "VERY_UNLIKELY": return 10;
        default: return 0;
    }
}

// GPT 모델을 통한 질의응답 처리
function talk() {
    const smodel = document.getElementById("modelSelect").value;
    const squestion = document.getElementById("questionInput").value;

    const data = {
        model: smodel,
        messages: [{ role: "user", content: squestion }]
    };

    $.ajax({
        type: "POST",
        url: "https://api.openai.com/v1/chat/completions",
        headers: { "Authorization": "Bearer " + OPENAPI_KEY },
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8"
    }).done(function (response) {
        document.getElementById("output").innerHTML = "<strong>응답:</strong> " + response.choices[0].message.content;
    }).fail(function () {
        document.getElementById("output").innerHTML = "<strong>오류:</strong> 응답을 받을 수 없습니다.";
    });
}

