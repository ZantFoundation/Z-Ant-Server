document.addEventListener('DOMContentLoaded', () => {
    let userSessionId = sessionStorage.getItem('userSessionId');

    if (!userSessionId) {
        userSessionId = crypto.randomUUID();
        sessionStorage.setItem('userSessionId', userSessionId);
        console.log('Generated new user session ID:', userSessionId);
    } else {
        console.log('Using existing user session ID:', userSessionId);
    }

    // Page elements
    const welcomePage = document.getElementById('welcomePage');
    const selectModelPage = document.getElementById('selectModelPage');
    const startButton = document.getElementById('startButton');
    const logoClick = document.getElementById('logoClick'); // Get logo reference
    // Add references for drop zone and file input
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const modelList = document.getElementById('modelList'); // Also need this for API call

    // --- Page Navigation ---
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (welcomePage) welcomePage.classList.replace('activePage', 'hiddenPage');
            if (selectModelPage) selectModelPage.classList.replace('hiddenPage', 'activePage'); // Show select model page
        });
    }

    // Add listener for logo click to return home
    if (logoClick) {
        logoClick.addEventListener('click', () => {
            // Hide the select model page if it's active
            if (selectModelPage && selectModelPage.classList.contains('activePage')) {
                 selectModelPage.classList.replace('activePage', 'hiddenPage');
            }
            // Add checks for other potential pages here if needed

            // Ensure welcome page is active
            if (welcomePage && !welcomePage.classList.contains('activePage')) { 
                welcomePage.classList.replace('hiddenPage', 'activePage'); 
            }
        });
    }

    // --- Drag and Drop & File Input ---
    if (dropZone && fileInput) {
        // Click to open file browser
        dropZone.addEventListener('click', (event) => {
            // Prevent triggering click if the click originated from inside the hidden input itself
            if (event.target !== fileInput) {
                 fileInput.click();
            }
        });

        // Drag over
        dropZone.addEventListener('dragover', (event) => {
            event.preventDefault(); // Necessary to allow drop
            dropZone.classList.add('dragover');
        });

        // Drag leave
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        // Drop
        dropZone.addEventListener('drop', (event) => {
            event.preventDefault(); // Prevent file opening in browser
            dropZone.classList.remove('dragover');

            if (event.dataTransfer.files && event.dataTransfer.files[0]) {
                const file = event.dataTransfer.files[0];
                if (file.name.endsWith('.onnx')) {
                    console.log('ONNX file dropped:', file.name);
                    handleFileUpload(file);
                } else {
                    alert('Please drop an .onnx file.');
                }
            }
        });

        // File input change (after clicking drop zone)
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.name.endsWith('.onnx')) {
                console.log('ONNX file selected:', file.name);
                handleFileUpload(file);
            } else if (file) {
                // Only alert if a file was selected but it wasn't .onnx
                alert('Please select an .onnx file.');
            }
             // Reset file input value to allow selecting the same file again if needed
            event.target.value = null;
        });
    }

    // --- Predefined Model Selection ---
    if (modelList) {
        modelList.addEventListener('click', (event) => {
            if (event.target.classList.contains('modelButton')) {
                const modelName = event.target.getAttribute('data-model');
                console.log('Predefined model selected:', modelName);
                sendCodegenRequest({ model: modelName });
            }
        });
    }

    // --- API Call Functions ---
    function handleFileUpload(file) {
        // For file uploads, the backend expects multipart/form-data
        const formData = new FormData();
        formData.append('id', userSessionId);
        formData.append('file', file);

        // Pass true to indicate FormData is being sent
        sendCodegenRequest(formData, true); 
    }

    // Re-add or ensure sendCodegenRequest handles both JSON and FormData
    async function sendCodegenRequest(data, isFormData = false) {
        const url = 'http://localhost:3000/codegen'; // Explicitly set backend URL
        const options = {
            method: 'POST',
            // Headers are set differently for FormData vs JSON
            headers: isFormData ? {} : { 'Content-Type': 'application/json' },
            body: isFormData ? data : JSON.stringify({ id: userSessionId, ...data })
        };

        console.log(`Sending request to ${url} with ${isFormData ? 'FormData' : 'JSON'}:`, options.body);

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                // Try to get more specific error from backend if possible
                const errorBody = await response.text(); 
                throw new Error(`HTTP error ${response.status}: ${errorBody || response.statusText}`);
            }

            const result = await response.json(); // Assume success response is JSON
            console.log('Codegen request successful:', result);
            alert('Codegen request successful! Check server logs or next steps.');
            // TODO: Handle successful response (e.g., display result, navigate)

        } catch (error) {
            console.error('Error sending codegen request:', error);
            alert(`Codegen request failed: ${error.message}`);
            // TODO: Handle error display for the user
        }
    }

});

