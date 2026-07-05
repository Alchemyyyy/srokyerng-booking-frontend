import os
import re

files = [
    "src/modules/analytics/pages/OwnerAnalyticsView.vue",
    "src/modules/properties/pages/OwnerPropertiesView.vue",
    "src/modules/properties/pages/OwnerPropertyDetailView.vue",
    "src/modules/rooms/pages/ManageRoomsView.vue",
    "src/modules/rooms/pages/OwnerRoomDetailView.vue",
    "src/modules/reservations/pages/OwnerReservationsView.vue",
    "src/modules/reservations/pages/OwnerReservationDetailView.vue",
    "src/modules/payments/pages/OwnerPaymentAccountsView.vue",
    "src/modules/owner/pages/OwnerPaymentsView.vue",
    "src/modules/owner/pages/OwnerPaymentDetailView.vue",
    "src/modules/amenities/pages/AmenityManagementView.vue",
    "src/modules/calendar/pages/BookingCalendarView.vue",
    "src/modules/owner/pages/OwnerProfileView.vue",
    "src/modules/owner/pages/OwnerReviewsView.vue"
]

def clean_template_tag(content):
    # Regex to find <template> and the immediate next tag (usually <main> or <div>)
    # and strip out the offending classes/directives.
    
    # We want to remove: my-25, mt-24, mt-25, px-6, p-6, pb-10, pb-24, transition-all duration-300, min-h-screen, transition-colors, antialiased
    # and the whole :class="isSidebarOpen ? 'ml-64' : 'ml-20'" part.
    
    # We will do a generic regex on the first opening tag after <template>
    template_idx = content.find("<template>")
    if template_idx == -1:
        return content
        
    end_of_tag = content.find(">", template_idx + 10)
    tag_str = content[template_idx + 10 : end_of_tag + 1]
    
    # Patterns to remove
    to_remove = [
        r'\bmy-25\b', r'\bmt-25\b', r'\bmt-24\b', r'\bpx-6\b', r'\bp-6\b', r'\bpb-10\b', r'\bpb-24\b',
        r'\btransition-all duration-300\b', r'\btransition-colors duration-300\b',
        r'\bmin-h-screen\b', r'\bantialiased\b', r'\bspace-y-6\b'
    ]
    
    new_tag = tag_str
    for p in to_remove:
        new_tag = re.sub(p, '', new_tag)
        
    # Also remove the whole :class attribute if it's the isSidebarOpen one
    new_tag = re.sub(r':class="isSidebarOpen\s*\?\s*\'ml-64\'\s*:\s*\'ml-20\'"', '', new_tag)
    
    # Clean up empty class attributes
    new_tag = re.sub(r'class="\s+"', '', new_tag)
    # Clean up multiple spaces
    new_tag = re.sub(r'\s+', ' ', new_tag).replace(' >', '>')
    
    # Convert <main to <div if we want to avoid nested mains
    new_tag = new_tag.replace('<main', '<div')
    
    # we need to replace the tag back
    new_content = content[:template_idx + 10] + new_tag + content[end_of_tag + 1:]
    
    # And replace </main> with </div> if we converted it
    if tag_str.strip().startswith("<main"):
        # reverse replace only the last </main> inside template
        last_main = new_content.rfind("</main>")
        if last_main != -1:
            new_content = new_content[:last_main] + "</div>" + new_content[last_main+7:]
            
    return new_content

def clean_script_setup(content):
    # Remove useSidebar import
    content = re.sub(r'import { useSidebar } from [\'"].*useSidebar[\'"];?\n?', '', content)
    # Remove const { isSidebarOpen } = useSidebar();
    content = re.sub(r'const { isSidebarOpen } = useSidebar\(\);?\n?', '', content)
    return content

for file_path in files:
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        continue
    with open(file_path, "r") as f:
        content = f.read()
    
    content = clean_script_setup(content)
    content = clean_template_tag(content)
    
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Processed {file_path}")
