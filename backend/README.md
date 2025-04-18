# Z-Ant Backend

Api gateway for Z-Ant functionalities.

1. Codegen
2. Libgen
3. Netron Imagegen

# Requirements

1. Zig 0.14.0 compiler
2. Zig Zap library
3. Z-Ant as a submodule

**To check out the api check the enpoints directory in src**

# Api

## Endpoints

1. /codegen
2. /libgen
3. /netron

### [POST] /codegen

Request Body:

```json
{
  "id": "User Session ID its generated on client side.",
  "file": "For custom onnx files `Either use predefined models or provide a file with this`",
  "model": "Use predefined model"
}
```

### [GET] /codegen

Request Body:

```json
{
  "id": "User Session ID its generated on client side.",
  "model": "Model which'll be downloaded"
}
```

### [POST] /libgen

Request Body:

```json
{
  "id": "User Session ID its generated on client side.",
  "model": "Model which'll create the lib",
  "target": "Target architecture",
  "cpu": "Target cpu"
}
```

### [GET] /libgen

Request Body:

```json
{
  "id": "User Session ID its generated on client side.",
  "model": "Model for the library downloaded"
}
```
