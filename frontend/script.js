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
    // Add references for deployment page
    const deploymentPage = document.getElementById('deploymentPage');
    const modelNameTitle = document.getElementById('modelNameTitle');
    // Add reference for download button
    const downloadZigBtn = document.getElementById('downloadZigBtn');
    // Add references for libgen button and inputs
    const generateLibBtn = document.getElementById('generateLibBtn');
    const architectureInput = document.getElementById('architectureInput');
    const cpuInput = document.getElementById('cpuInput');
    const visualizeBtn = document.getElementById('visualizeBtn');
    // Add references for modal elements
    const svgModal = document.getElementById('svgModal');
    const modalOverlay = document.querySelector('.modalOverlay'); // Use querySelector for class
    const svgContainer = document.getElementById('svgContainer');
    // Add reference for the download lib button (to enable/disable)
    const downloadLibBtn = document.getElementById('downloadLibBtn'); 
    // Add reference for loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Variable to store the current model name for download requests
    let currentModelName = null; 

    // --- Page Navigation Helper ---
    function switchPageWithAnimation(currentPage, nextPage, direction = 'right') { // Default direction is right
        if (currentPage && nextPage) {
            currentPage.classList.replace('activePage', 'hiddenPage');
            nextPage.classList.replace('hiddenPage', 'activePage');
            
            // Determine animation class based on direction
            const animationClass = direction === 'left' ? 'slide-in-left' : 'slide-in';
            
            // Apply animation class
            nextPage.classList.add(animationClass);
            
            // Remove animation class after animation ends (adjust time based on CSS)
            nextPage.addEventListener('animationend', () => {
                nextPage.classList.remove(animationClass);
            }, { once: true }); // Ensure listener runs only once
        }
    }

    // --- Page Navigation ---
    // Add event listener for all back buttons
    document.querySelectorAll('.backButton').forEach(button => {
        button.addEventListener('click', () => {
            // Custom back navigation logic
            if (deploymentPage.classList.contains('activePage')) {
                // Reset deployment page state
                if (architectureInput) architectureInput.value = '';
                if (cpuInput) cpuInput.value = '';
                if (downloadLibBtn) downloadLibBtn.disabled = true;
                currentModelName = null;
                // Switch page with animation from LEFT
                switchPageWithAnimation(deploymentPage, selectModelPage, 'left');
            } else if (selectModelPage.classList.contains('activePage')) {
                // Switch page with animation from LEFT
                switchPageWithAnimation(selectModelPage, welcomePage, 'left');
            }
        });
    });

    if (startButton) {
        startButton.addEventListener('click', () => {
            switchPageWithAnimation(welcomePage, selectModelPage); // Default: slide from right
        });
    }

    // Add listener for logo click to return home
    if (logoClick) {
        logoClick.addEventListener('click', () => {
            let currentPage = null;
            if (selectModelPage && selectModelPage.classList.contains('activePage')) {
                 currentPage = selectModelPage;
            }
            if (deploymentPage && deploymentPage.classList.contains('activePage')) {
                 currentPage = deploymentPage;
            }

            // Only navigate if we are not already on the welcome page
            if (currentPage && welcomePage) {
                switchPageWithAnimation(currentPage, welcomePage, 'left'); // Slide from left when going home
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
        showLoadingOverlay(); // Show overlay
        const url = 'http://localhost:3000/codegen'; // Explicitly set backend URL
        let modelName = 'Unknown Model'; // Default model name

        // Determine model name for the title
        if (isFormData) {
            // Extract filename from FormData (assuming 'file' field exists)
            const file = data.get('file');
            if (file && file.name) {
                 const dotIndex = file.name.lastIndexOf('.');
                 modelName = dotIndex > 0 ? file.name.substring(0, dotIndex) : file.name;
            }
        } else {
             // Get model name from JSON data (assuming 'model' field exists)
             if (data.model) {
                 modelName = data.model;
             }
        }

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
            // alert('Codegen request successful! Check server logs or next steps.'); // Replace alert with page navigation
            
            // Navigate to Deployment Page on Success
            if (deploymentPage && modelNameTitle) {
                currentModelName = modelName; // Store the model name
                modelNameTitle.textContent = `Deploy ${currentModelName}`; // Update title format
                switchPageWithAnimation(selectModelPage, deploymentPage); // Default: slide from right
            } else {
                console.error('Deployment page elements not found!');
            }

        } catch (error) {
            console.error('Error sending codegen request:', error);
            alert(`Codegen request failed: ${error.message}`);
            // TODO: Handle error display for the user
        } finally {
            hideLoadingOverlay(); // Hide overlay regardless of outcome
        }
    }

    // --- Loading Overlay Functions ---
    function showLoadingOverlay() {
        if (loadingOverlay) loadingOverlay.classList.replace('hiddenPage', 'activePage');
    }

    function hideLoadingOverlay() {
         if (loadingOverlay) loadingOverlay.classList.replace('activePage', 'hiddenPage');
    }

    // --- Deployment Page Button Listeners ---
    if (downloadZigBtn) {
        downloadZigBtn.addEventListener('click', async () => {
            showLoadingOverlay(); // Show overlay
            if (!currentModelName) {
                alert('Model name is not available.');
                return;
            }
            if (!userSessionId) {
                 alert('User session ID is not available.');
                 return;
            }

            // Construct URL with query parameters
            const url = new URL('http://localhost:3000/codegen');
            url.searchParams.append('id', userSessionId);
            url.searchParams.append('model', currentModelName);

            console.log(`Sending GET request to: ${url}`);

            try {
                const response = await fetch(url.toString(), { // Convert URL object to string
                    method: 'GET',
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`HTTP error ${response.status}: ${errorBody || response.statusText}`);
                }

                // Handle the file download
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = downloadUrl;
                // Set the download filename (e.g., modelName.zip)
                a.download = `${currentModelName}.zip`; 
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                a.remove();

                console.log('Zig code download initiated successfully.');

            } catch (error) {
                console.error('Error downloading Zig code:', error);
                alert(`Failed to download Zig code: ${error.message}`);
            } finally {
                 hideLoadingOverlay(); // Hide overlay regardless of outcome
            }
        });
    }

    // Libgen button listener
    if (generateLibBtn && architectureInput && cpuInput) {
        generateLibBtn.addEventListener('click', async () => {
            showLoadingOverlay(); // Show overlay
            const arch = architectureInput.value.trim();
            const cpu = cpuInput.value.trim();

            if (!currentModelName || !userSessionId || !arch || !cpu) {
                alert('Please ensure Model Name, Session ID, Architecture, and CPU are available and fields are filled.');
                return;
            }

            const url = 'http://localhost:3000/libgen';
            const payload = {
                id: userSessionId,
                model: currentModelName,
                target: arch,
                cpu: cpu,
            };

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            };

            console.log(`Sending POST request to ${url} with JSON:`, payload);

            try {
                const response = await fetch(url, options);

                if (!response.ok) {
                    const errorBody = await response.text(); 
                    throw new Error(`HTTP error ${response.status}: ${errorBody || response.statusText}`);
                }

                // Assuming backend sends plain text now (based on libgen.zig)
                const resultText = await response.text(); 
                console.log('Libgen request successful:', resultText);
                // alert(resultText || 'Library generation request successful!'); // Removed success alert
                
                // Enable the download button on success
                if (downloadLibBtn) {
                    downloadLibBtn.disabled = false;
                }

            } catch (error) {
                console.error('Error sending libgen request:', error);
                alert(`Libgen request failed: ${error.message}`);
            } finally {
                 hideLoadingOverlay(); // Hide overlay regardless of outcome
            }
        });
    }

    // Download Static Library button listener
    if (downloadLibBtn) {
        downloadLibBtn.addEventListener('click', async () => {
            if (!currentModelName || !userSessionId) {
                alert('Model name or session ID is missing.');
                return;
            }
            
            showLoadingOverlay();
            
            // Construct URL with query parameters
            const url = new URL('http://localhost:3000/libgen');
            url.searchParams.append('id', userSessionId);
            url.searchParams.append('model', currentModelName);

            console.log(`Sending GET request to: ${url}`);

            try {
                const response = await fetch(url.toString(), { method: 'GET' });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`HTTP error ${response.status}: ${errorBody || response.statusText}`);
                }

                // Handle the file download
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = downloadUrl;
                // Set the download filename (e.g., modelName.a)
                a.download = `${currentModelName}.a`; // Use .a extension
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                a.remove();

                console.log('Static library download initiated successfully.');

            } catch (error) {
                console.error('Error downloading static library:', error);
                alert(`Failed to download static library: ${error.message}`);
            } finally {
                 hideLoadingOverlay(); // Hide overlay regardless of outcome
            }
        });
    }

    // --- Modal Open/Close Functions ---
    function openModal() {
        if (svgModal) svgModal.classList.replace('hiddenPage', 'activePage');
        // Add listener for Escape key
        document.addEventListener('keydown', handleEscapeKey);
    }

    function closeModal() {
        if (svgModal) svgModal.classList.replace('activePage', 'hiddenPage');
        if (svgContainer) svgContainer.innerHTML = ''; // Clear SVG content
         // Remove listener for Escape key
        document.removeEventListener('keydown', handleEscapeKey);
    }

    function handleEscapeKey(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    // Close modal listeners
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Visualize Model button listener (Static SVG version)
    if (visualizeBtn) {
        visualizeBtn.addEventListener('click', async () => {
            showLoadingOverlay(); // Show overlay
            const svgUrl = 'resources/best.onnx.svg'; // Path to your static SVG
            console.log(`Fetching static SVG from: ${svgUrl}`);

             try {
                const response = await fetch(svgUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
                }
                if (!response.headers.get('content-type')?.includes('svg')) {
                    console.warn('Response does not appear to be an SVG file.');
                    // Handle non-SVG response if necessary, maybe just show text?
                }

                const svgText = await response.text();
                
                if (svgContainer) {
                    svgContainer.innerHTML = svgText; // Inject SVG content
                    openModal(); // Open the modal
                    console.log('SVG loaded into modal.');
                } else {
                    console.error('SVG container element not found!');
                }

            } catch (error) {
                console.error('Error fetching or displaying static SVG:', error);
                alert(`Failed to visualize model: ${error.message}`);
            } finally {
                 hideLoadingOverlay(); // Hide overlay regardless of outcome
            }
        });
    }

});

