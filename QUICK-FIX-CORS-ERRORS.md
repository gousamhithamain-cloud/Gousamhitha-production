# Fix CORS Errors - Quick Guide

## The Problem
You're seeing these errors because you're opening the HTML file directly (`file://` protocol). Modern browsers block JavaScript modules and some resources when loaded this way for security reasons.

## The Solution
You MUST run a local web server. Here are 3 easy ways:

---

## Method 1: Use the Batch File (Easiest!)

1. Double-click `START-SERVER.bat` in the `ecommerce-main` folder
2. A command window will open and start the server
3. Open your browser and go to: **http://localhost:8000**
4. To stop: Press `Ctrl+C` in the command window

---

## Method 2: Python (If Installed)

### If you have Python 3:
```bash
cd ecommerce-main
python -m http.server 8000
```

### If you have Python 2:
```bash
cd ecommerce-main
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

---

## Method 3: Node.js (If Installed)

### Install http-server globally:
```bash
npm install -g http-server
```

### Run the server:
```bash
cd ecommerce-main
http-server -p 8000
```

Then open: **http://localhost:8000**

---

## Method 4: VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Browser will open automatically

---

## Why This Happens

### CORS (Cross-Origin Resource Sharing)
- Browsers block loading JavaScript modules from `file://` protocol
- This is a security feature to prevent malicious scripts
- Web servers serve files over `http://` which doesn't have this restriction

### What Gets Blocked:
- ❌ ES6 modules (`import`/`export`)
- ❌ Some external resources
- ❌ Fetch API to external URLs
- ❌ Service workers

### What Works with Web Server:
- ✅ All JavaScript modules load properly
- ✅ Nhost authentication works
- ✅ External API calls work
- ✅ No CORS errors

---

## Quick Check

After starting the server, you should see in console:
```
✅ Profile handler loaded
✅ Nhost client initialized
✅ Profile button found, attaching click handler...
```

Instead of:
```
❌ Access to script blocked by CORS policy
❌ Failed to load resource: net::ERR_FAILED
```

---

## Recommended: Python Method

Python is the easiest because:
- Usually pre-installed on Mac/Linux
- Easy to install on Windows
- No additional packages needed
- One simple command

### Install Python on Windows:
1. Go to: https://www.python.org/downloads/
2. Download Python 3.x
3. Run installer
4. ✅ Check "Add Python to PATH"
5. Click "Install Now"

---

## After Starting Server

1. Open browser to: **http://localhost:8000**
2. Click the profile icon
3. Login modal should open
4. No CORS errors in console
5. All scripts load successfully

---

## Troubleshooting

### Port 8000 already in use?
Change the port number:
```bash
python -m http.server 8080
```
Then open: **http://localhost:8080**

### Can't find Python/Node?
- Make sure it's installed
- Restart your terminal/command prompt
- Check if it's in your PATH

### Still getting errors?
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private mode
- Check browser console for specific errors

---

## Status After Fix
✅ No CORS errors
✅ All scripts load
✅ Modules work
✅ Profile button works
✅ Nhost authentication ready
