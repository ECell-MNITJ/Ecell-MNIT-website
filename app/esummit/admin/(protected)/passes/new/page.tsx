import PassForm from '@/components/esummit/admin/PassForm';

export default function NewPassPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create New Pass</h1>
                <p className="text-gray-400">Configure a new ticket option for E-Summit attendees.</p>
            </div>

            <PassForm />
        </div>
    );
}
