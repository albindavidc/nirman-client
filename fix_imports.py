import os

def get_relative_path_to_app(current_dir, app_root):
    return os.path.relpath(app_root, current_dir).replace('\\', '/')

def fix_file(file_path, app_root):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    modified = False
    file_dir = os.path.dirname(file_path)
    # Calculate path from current file to 'src/app'
    # app_root should be '.../src/app'
    rel_to_app = get_relative_path_to_app(file_dir, app_root)
    
    # We want imports to core/ and shared/ to look like:
    # import ... from '{rel_to_app}/core/...'
    # import ... from '{rel_to_app}/shared/...'

    for line in lines:
        if 'from \'' in line and ('/core/' in line or '/shared/' in line):
            # Check for relative imports starting with ../
            if 'from \'../' in line:
                # Extract the import path
                start_quote = line.index('\'') + 1
                end_quote = line.index('\'', start_quote)
                import_path = line[start_quote:end_quote]

                if '/core/' in import_path:
                    # Construct correct path
                    remainder = import_path.split('/core/', 1)[1]
                    new_path = f"{rel_to_app}/core/{remainder}"
                    if new_path != import_path:
                        line = line.replace(f"'{import_path}'", f"'{new_path}'")
                        modified = True
                
                elif '/shared/' in import_path:
                     # Construct correct path
                    remainder = import_path.split('/shared/', 1)[1]
                    new_path = f"{rel_to_app}/shared/{remainder}"
                    if new_path != import_path:
                        line = line.replace(f"'{import_path}'", f"'{new_path}'")
                        modified = True

        new_lines.append(line)

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Fixed: {file_path}")

def main():
    # Assume script is run from front-end/
    # so src/app is at ./src/app
    base_dir = os.getcwd()
    app_root = os.path.join(base_dir, 'src', 'app')
    features_dir = os.path.join(app_root, 'features')

    for root, dirs, files in os.walk(features_dir):
        for file in files:
            if file.endswith('.ts'):
                fix_file(os.path.join(root, file), app_root)

if __name__ == '__main__':
    main()
