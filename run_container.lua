#!/usr/bin/env lua

local args = {...}
local mode = "node"

if #args > 0 then
    if args[1] == "-n" then
        mode = "node"
    elseif args[1] == "-d" then
        mode = "deno"
    elseif args[1] == "-b" then
        mode = "bun"
    else
        io.stderr:write("Error: Invalid option. Use -n for Node.js, -d for Deno, or -b for Bun.\n")
        os.exit(1)
    end
end

local function get_env_var(name)
    local value = os.getenv(name)
    if not value or value == "" then
        io.stderr:write("Error: Environment variable " .. name .. " is not set.\n")
        os.exit(1)
    end
    return value
end

local DATABASE = get_env_var("DATABASE")
local DB_USER = get_env_var("DB_USER")
local DB_PWD = get_env_var("DB_PWD")

local dockerfile_map = {
    node = "Dockerfile.node",
    deno = "Dockerfile.deno",
    bun = "Dockerfile.bun"
}

local image_map = {
    node = "nestjs-express-typeorm-node",
    deno = "nestjs-express-typeorm-deno",
    bun = "nestjs-express-typeorm-bun"
}

local selected_dockerfile = dockerfile_map[mode]
local selected_image = image_map[mode]

local build_command = string.format("podman build -f %s -t %s:latest .", selected_dockerfile, selected_image)
print("Building the container image with " .. mode .. "...")
local build_success, build_reason, build_code = os.execute(build_command)
if not build_success then
    io.stderr:write("Error: Failed to build the container image.\n")
    io.stderr:write("Reason: " .. tostring(build_reason) .. "\n")
    os.exit(1)
end

local run_command = string.format(
    "podman run -d -p 8001:8001 --network=host " ..
    "-e DATABASE=%q -e DB_USER=%q -e DB_PWD=%q " ..
    "--replace --name %s %s:latest",
    DATABASE, DB_USER, DB_PWD, selected_image, selected_image
)

print("Running the container...")
local run_success, run_reason, run_code = os.execute(run_command)
if not run_success then
    io.stderr:write("Error: Failed to run the container.\n")
    io.stderr:write("Reason: " .. tostring(run_reason) .. "\n")
    os.exit(1)
end

print("Container is running successfully.")
