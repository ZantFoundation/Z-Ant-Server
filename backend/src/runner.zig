const std = @import("std");
const constants = @import("constants.zig");

pub fn writeFileToDatabase(allocator: std.mem.Allocator, data: []const u8, dir_path: []const u8, file_name: []const u8) !void {
    const file_path = try std.fmt.allocPrint(allocator, "{s}/{s}.onnx", .{ dir_path, file_name });
    defer allocator.free(file_path);
    const file = try std.fs.cwd().createFile(file_path, .{ .truncate = true });
    defer file.close();
    try file.writeAll(data);
}

pub fn codeGenCustom(allocator: std.mem.Allocator, model_path: []const u8, generated_code_path: []const u8, file_name: []const u8) !void {
    const model_flag = try std.fmt.allocPrint(allocator, "-Dmodel={s}", .{file_name});
    defer allocator.free(model_flag);
    const model_path_flag = try std.fmt.allocPrint(allocator, "-Dmodel_path=../../{s}/{s}.onnx", .{ model_path, file_name });
    defer allocator.free(model_path_flag);
    const generated_code_path_flag = try std.fmt.allocPrint(allocator, "-Dgenerated_path=../../{s}", .{generated_code_path});
    defer allocator.free(generated_code_path_flag);
    var codegen_args = [_][]const u8{
        "zig",
        "build",
        "codegen",
        model_flag,
        model_path_flag,
        generated_code_path_flag,
    };
    var codegen_child = std.process.Child.init(&codegen_args, allocator);
    codegen_child.cwd = "vendor/Z-Ant";
    try codegen_child.spawn();
    const codegen_result = try codegen_child.wait();
    if (codegen_result.Exited != 0) return error.CodeGenFailed;
}

pub fn codeGenModel(allocator: std.mem.Allocator, generated_code_path: []const u8, model_name: []const u8) !void {
    const model_flag = try std.fmt.allocPrint(allocator, "-Dmodel={s}", .{model_name});
    defer allocator.free(model_flag);
    const generated_code_path_flag = try std.fmt.allocPrint(allocator, "-Dgenerated_path=../../{s}", .{generated_code_path});
    defer allocator.free(generated_code_path_flag);
    var codegen_args = [_][]const u8{
        "zig",
        "build",
        "codegen",
        model_flag,
        generated_code_path_flag,
    };
    var codegen_child = std.process.Child.init(&codegen_args, allocator);
    codegen_child.cwd = "vendor/Z-Ant";
    try codegen_child.spawn();
    const codegen_result = try codegen_child.wait();
    if (codegen_result.Exited != 0) return error.CodeGenFailed;
}

pub fn zipFolder(allocator: std.mem.Allocator, generate_path: []const u8, file_name: []const u8) !void {
    const zip_name = try std.fmt.allocPrint(allocator, "../zip/{s}.zip", .{file_name});
    defer allocator.free(zip_name);

    var zip_args = [_][]const u8{
        "zip",
        "-r",
        zip_name, // Now using the dynamically generated zip_name
        file_name,
    };

    var zip_child = std.process.Child.init(&zip_args, allocator);
    zip_child.cwd = generate_path;
    try zip_child.spawn();
    const zip_result = try zip_child.wait();
    if (zip_result.Exited != 0) return error.ZipFailed;
}

pub fn libGen(allocator: std.mem.Allocator, model_name: []const u8, target_arch: []const u8, cpu: []const u8, output_path: []const u8, generated_path: []const u8) !void {
    //zig build lib -Dmodel=model_name -Dtarget=target_arch -Dcpu=specific_cpu -Doutput_path=output_path -Dgenerated_path=generated_path
    const model_name_flag = try std.fmt.allocPrint(allocator, "-Dmodel={s}", .{model_name});
    defer allocator.free(model_name_flag);
    const target_arch_flag = try std.fmt.allocPrint(allocator, "-Dtarget={s}", .{target_arch});
    defer allocator.free(target_arch_flag);
    const cpu_flag = try std.fmt.allocPrint(allocator, "-Dcpu={s}", .{cpu});
    defer allocator.free(cpu_flag);
    const output_path_flag = try std.fmt.allocPrint(allocator, "-Doutput_path=../../{s}", .{output_path});
    defer allocator.free(output_path_flag);
    const generated_path_flag = try std.fmt.allocPrint(allocator, "-Dgenerated_path=../../{s}", .{generated_path});
    defer allocator.free(generated_path_flag);

    var libgen_args = [_][]const u8{
        "zig",
        "build",
        "lib",
        model_name_flag,
        target_arch_flag,
        cpu_flag,
        output_path_flag,
        generated_path_flag,
    };

    var libgen_child = std.process.Child.init(&libgen_args, allocator);
    libgen_child.cwd = "vendor/Z-Ant";
    try libgen_child.spawn();
    const libgen_result = try libgen_child.wait();
    if (libgen_result.Exited != 0) return error.LibGenFailed;
}

pub fn runNetron(allocator: std.mem.Allocator, netron_output_file_path: []const u8, model_path: []const u8) !void {
    var netron_args = [_][]const u8{
        "netron_export",
        model_path,
        "--output",
        netron_output_file_path,
    };

    std.debug.print("Netron args: {s}\n", .{netron_args});

    var netron_child = std.process.Child.init(&netron_args, allocator);
    netron_child.cwd = ".";
    try netron_child.spawn();
    const netron_result = try netron_child.wait();
    if (netron_result.Exited != 0) return error.NetronFailed;
}
